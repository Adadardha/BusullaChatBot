import { QuizAnswer, PredictionResult } from '../types';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

type InterviewVerdict = { hired: boolean; feedback: string };

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
const HF_MODEL = import.meta.env.VITE_HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
const HF_URL = 'https://router.huggingface.co/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const message = String(error?.message || '').toLowerCase();
    const isRateLimit =
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('resource_exhausted');
    if (retries > 0 && isRateLimit) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

function extractJson(text: string): string {
  const clean = text.replace(/```json|```/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return '{}';
  return clean.slice(start, end + 1);
}

function safeParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(extractJson(text)) as T;
  } catch {
    return fallback;
  }
}

function normalizePrediction(raw: any): PredictionResult {
  const fallbackAlternatives = [
    { career: 'Menaxher Projekti', confidence: 0.65, description: 'Koordinimi dhe menaxhimi i projekteve.' },
    { career: 'Analist të Dhënash', confidence: 0.60, description: 'Analiza dhe interpretimi i të dhënave.' },
  ];

  return {
    primaryCareer: raw?.primaryCareer || raw?.primary?.title || 'Zhvillues Software',
    confidence: typeof raw?.confidence === 'number' ? raw.confidence : (raw?.primary?.percentage ? raw.primary.percentage / 100 : 0.75),
    description: raw?.description || raw?.primary?.description || 'Përputhje e mirë bazuar në profilin tuaj.',
    alternatives: Array.isArray(raw?.alternatives) && raw.alternatives.length > 0
      ? raw.alternatives.slice(0, 2).map((a: any) => ({
          career: a.career || a.title || 'Alternativë',
          confidence: typeof a.confidence === 'number' ? a.confidence : (a.percentage ? a.percentage / 100 : 0.6),
          description: a.description || 'Alternativë karriere.',
        }))
      : fallbackAlternatives,
    learningPath: Array.isArray(raw?.learningPath)
      ? raw.learningPath
      : (Array.isArray(raw?.primary?.learningPath?.courses) ? raw.primary.learningPath.courses : ['Filloni me kurse bazë', 'Praktikë projekti', 'Ndërtoni portfolio']),
  };
}

async function callModel(messages: ChatMessage[], temperature = 0.4): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error('Mungon VITE_HF_API_KEY. Shtoje në .env.local që të përdorësh chatbot-in.');
  }

  const response = await fetch(HF_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HF_API_KEY}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      temperature,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

export const predictCareer = async (answers: QuizAnswer[]): Promise<PredictionResult> => {
  const prompt = `Analizo përgjigjet e mëposhtme për orientim karriere dhe kthe vetëm JSON valid me këtë format:
{
  "primaryCareer": "emri i karrierës kryesore",
  "confidence": 0.85,
  "description": "përshkrimi i karrierës",
  "alternatives": [
    { "career": "karriera alternative 1", "confidence": 0.70, "description": "përshkrimi" },
    { "career": "karriera alternative 2", "confidence": 0.65, "description": "përshkrimi" }
  ],
  "learningPath": ["hapi 1", "hapi 2", "hapi 3"]
}
Përgjigju vetëm në shqip dhe mos shto tekst jashtë JSON.
Përgjigjet e përdoruesit: ${JSON.stringify(answers)}`;

  return withRetry(async () => {
    const text = await callModel([
      {
        role: 'system',
        content: 'Ti je këshilltar karriere për tregun shqiptar. Jep përgjigje profesionale dhe konkrete.',
      },
      { role: 'user', content: prompt },
    ]);

    return normalizePrediction(safeParse<any>(text, {}));
  });
};

export const generateInterviewQuestion = async (career: string, history: any[], level: Difficulty): Promise<string> => {
  return withRetry(async () => {
    const text = await callModel([
      {
        role: 'system',
        content: 'Ti je intervistues teknik. Gjithmonë përgjigju në shqip me pyetje të qarta.',
      },
      {
        role: 'user',
        content: `Ti je intervistues ekspert për ${career}. Niveli i vështirësisë: ${level}.\nBëj një pyetje të vetme, specifike për fushën.\nHistoria: ${JSON.stringify(history)}`,
      },
    ]);
    return text || 'Na trego si do e qaseshe këtë rol në 90 ditët e para?';
  });
};

export const evaluateAnswer = async (career: string, question: string, answer: string): Promise<string> => {
  return withRetry(async () => {
    const text = await callModel([
      {
        role: 'system',
        content: 'Ti je intervistues dhe vlerësues. Jep feedback të shkurtër dhe praktik në shqip.',
      },
      {
        role: 'user',
        content: `Si intervistues për ${career}, vlerëso këtë përgjigje në shqip.\nFormat i detyrueshëm: [SCOR: X/10] Shpjegimi.\nQuestion: ${question}\nAnswer: ${answer}`,
      },
    ]);
    return text || '[SCOR: 6/10] Përgjigjja ka bazë, por duhet më shumë shembuj praktikë dhe metrika.';
  });
};

export const evaluateFinalInterview = async (career: string, history: any[]): Promise<InterviewVerdict> => {
  return withRetry(async () => {
    const text = await callModel([
      {
        role: 'system',
        content: 'Ti je menaxher punësimi. Vendos qartë nëse kandidati pranohet dhe jep feedback në shqip.',
      },
      {
        role: 'user',
        content: `Analizo performancën e plotë të intervistës për ${career}.\nKthe vetëm JSON valid në formatin:\n{"hired": true/false, "feedback": "..."}\nHistoria: ${JSON.stringify(history)}`,
      },
    ]);

    return safeParse<InterviewVerdict>(text, {
      hired: false,
      feedback: 'Performanca ishte premtuese, por duhen forcuar përgjigjet teknike dhe shembujt konkretë.',
    });
  });
};

export const getAssistantResponse = async (userMessage: string, context?: string): Promise<string> => {
  return withRetry(async () => {
    const text = await callModel(
      [
        {
          role: 'system',
          content: `Ti je "Busulla AI", një career coach për tregun shqiptar. Gjithmonë përgjigju në shqip, profesional, i drejtpërdrejtë dhe praktik. Konteksti i përdoruesit: ${context || 'Këshilla të përgjithshme'}.`,
        },
        { role: 'user', content: userMessage },
      ],
      0.6,
    );

    return text || 'Më vjen keq, provo ta riformulosh pyetjen me më shumë detaje.';
  });
};

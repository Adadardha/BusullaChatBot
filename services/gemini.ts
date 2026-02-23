import { QuizAnswer, PredictionResult } from '../types';
import { classifyToPrediction } from './classifier';

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

async function callModel(messages: ChatMessage[], temperature = 0.4): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error('Mungon VITE_HF_API_KEY.');
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

/**
 * Attempts to enrich the local classifier result with a natural-language
 * description from the LLM. Falls back silently to the local result.
 */
async function enrichWithLLM(base: PredictionResult, answers: QuizAnswer[]): Promise<PredictionResult> {
  const prompt = `Bazuar në këto përgjigje quiz karriere, shkruaj një paragraf të shkurtër (2-3 fjali) në shqip që shpjegon pse "${base.primaryCareer}" është karriera kryesore e rekomanduar. Mos shto tekst tjetër, vetëm paragrafi.
Përgjigjet: ${JSON.stringify(answers.map(a => a.answer))}`;

  try {
    const text = await callModel([
      {
        role: 'system',
        content: 'Ti je këshilltar karriere për tregun shqiptar. Jep përgjigje të shkurtra dhe profesionale.',
      },
      { role: 'user', content: prompt },
    ]);
    if (text && text.length > 20) {
      return { ...base, description: text };
    }
  } catch {
    // silently fall through to local result
  }
  return base;
}

export const predictCareer = async (answers: QuizAnswer[]): Promise<PredictionResult> => {
  const localResult = classifyToPrediction(answers);

  if (!HF_API_KEY) {
    return localResult;
  }

  return withRetry(() => enrichWithLLM(localResult, answers));
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

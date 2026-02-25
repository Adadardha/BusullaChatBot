import { GoogleGenAI } from "@google/genai";
import {
  QuizAnswer,
  PredictionResult,
  InterviewMode,
  DifficultyLevel,
  InterviewFeedback,
  InterviewMessage,
  InterviewSession,
  InterviewReport,
  ChatMessage,
} from '../types';
import { classifyToPrediction } from './classifier';

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

const HF_API_KEY =
  import.meta.env.VITE_HF_API_KEY ||
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.GEMINI_API_KEY;
const HF_MODEL =
  import.meta.env.VITE_HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
const HF_URL = 'https://router.huggingface.co/v1/chat/completions';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || (import.meta.env as any).GEMINI_API_KEY;
const geminiAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// ✅ FIXED: Correct model names
const GEMINI_MODEL_PRO   = 'gemini-1.5-flash';
const GEMINI_MODEL_FLASH = 'gemini-1.5-flash';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type InterviewVerdict = { hired: boolean; feedback: string };

interface ChatMessageAPI {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ─────────────────────────────────────────────
// Shared utilities
// ─────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 2000,
): Promise<T> {
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
      await new Promise((r) => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

function extractJson(text: string): string {
  const clean = text.replace(/```json|```/g, '').trim();
  const start = clean.indexOf('{');
  const end   = clean.lastIndexOf('}');
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

// ─────────────────────────────────────────────
// HuggingFace caller
// ─────────────────────────────────────────────

async function callHF(
  messages: ChatMessageAPI[],
  temperature = 0.4,
): Promise<string> {
  if (!HF_API_KEY) throw new Error('Mungon VITE_HF_API_KEY.');

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
    throw new Error(`HF ${response.status} ${response.statusText}: ${body}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

// ─────────────────────────────────────────────
// ✅ FIXED: Gemini caller using correct @google/genai SDK
// ─────────────────────────────────────────────

async function callGemini(prompt: string, modelName: string = GEMINI_MODEL_PRO): Promise<string> {
  if (!geminiAI) throw new Error('Mungon Gemini API key.');

  const response = await geminiAI.models.generateContent({
    model: modelName,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  // ✅ FIXED: Correct way to get text from @google/genai response
  return response.text ?? '';
}

// ─────────────────────────────────────────────
// ✅ FIXED: Gemini structured JSON caller
// ─────────────────────────────────────────────

async function callGeminiStructured<T>(
  prompt: string,
  _responseSchema: any,
  modelName: string = GEMINI_MODEL_PRO,
): Promise<T> {
  if (!geminiAI) throw new Error('Mungon Gemini API key.');

  const instruction = `${prompt}\n\nKthe vetëm JSON të vlefshëm që përputhet me formatin e kërkuar (pa tekst shtesë, pa \`\`\`json).`;

  const response = await geminiAI.models.generateContent({
    model: modelName,
    contents: [{ role: 'user', parts: [{ text: instruction }] }],
  });

  const text = response.text ?? '{}';
  return safeParse<T>(text, {} as T);
}

// ─────────────────────────────────────────────
// Unified model caller: HF first, Gemini fallback
// ─────────────────────────────────────────────

async function callModel(
  messages: ChatMessageAPI[],
  temperature = 0.4,
): Promise<string> {
  // Try HuggingFace first
  if (HF_API_KEY) {
    try {
      const result = await callHF(messages, temperature);
      if (result) return result;
    } catch (err: any) {
      console.warn('HF failed, falling back to Gemini:', err?.message);
    }
  }

  // Gemini fallback — flatten messages into a single prompt
  const flatPrompt = messages
    .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
    .join('\n\n');

  const geminiModel =
    messages.some((m) => m.content.length > 800)
      ? GEMINI_MODEL_PRO
      : GEMINI_MODEL_FLASH;

  return callGemini(flatPrompt, geminiModel);
}

// ─────────────────────────────────────────────
// Career Prediction
// ─────────────────────────────────────────────

async function enrichWithLLM(
  base: PredictionResult,
  answers: QuizAnswer[],
): Promise<PredictionResult> {
  const prompt = `Bazuar në këto përgjigje quiz karriere, shkruaj një paragraf të shkurtër (2-3 fjali) në shqip që shpjegon pse "${base.primaryCareer}" është karriera kryesore e rekomanduar. Mos shto tekst tjetër, vetëm paragrafi.\nPërgjigjet: ${JSON.stringify(answers.map((a) => a.answer))}`;

  try {
    const text = await callModel(
      [
        { role: 'system', content: 'Ti je këshilltar karriere për tregun shqiptar. Jep përgjigje të shkurtra dhe profesionale.' },
        { role: 'user', content: prompt },
      ],
    );
    if (text && text.length > 20) return { ...base, description: text };
  } catch {
    // fall through to local result
  }
  return base;
}

export const predictCareer = async (answers: QuizAnswer[]): Promise<PredictionResult> => {
  // ✅ Always compute local result first — works without any API
  const localResult = classifyToPrediction(answers);

  if (!HF_API_KEY && !GEMINI_API_KEY) return localResult;

  // Try Gemini structured prediction
  if (GEMINI_API_KEY) {
    try {
      const result = await withRetry(() =>
        callGeminiStructured<any>(
          `Analize këto përgjigje të kuizit të karrierës dhe kthe JSON me këto fusha:
{
  "primaryCareer": "emri i karrierës kryesore në shqip",
  "confidence": 0.85,
  "description": "përshkrim 2-3 fjali pse kjo karrierë",
  "alternatives": [
    {"career": "karriera 2", "confidence": 0.70, "description": "përshkrim i shkurtër"},
    {"career": "karriera 3", "confidence": 0.55, "description": "përshkrim i shkurtër"}
  ],
  "learningPath": ["hapi 1", "hapi 2", "hapi 3", "hapi 4", "hapi 5"]
}

Karriera kryesore sipas analizës lokale: ${localResult.primaryCareer}
Alternativat: ${localResult.alternatives.map(a => a.career).join(', ')}
Përgjigjet: ${JSON.stringify(answers.map(a => a.answer))}`,
          {},
        ),
      );
      // Validate result has required fields
      if (result?.primaryCareer && result?.confidence && result?.description) {
        return result as PredictionResult;
      }
    } catch (err) {
      console.warn('Gemini structured prediction failed, falling back to enrich:', err);
    }
  }

  return withRetry(() => enrichWithLLM(localResult, answers));
};

// ─────────────────────────────────────────────
// Interview Question Generation
// ─────────────────────────────────────────────

export const generateInterviewQuestion = async (
  career: string,
  history: any[],
  level: Difficulty,
): Promise<string> => {
  return withRetry(async () => {
    const text = await callModel([
      { role: 'system', content: 'Ti je intervistues teknik. Gjithmonë përgjigju në shqip me pyetje të qarta.' },
      { role: 'user', content: `Ti je intervistues ekspert për ${career}. Niveli i vështirësisë: ${level}.\nBëj një pyetje të vetme, specifike për fushën.\nHistoria: ${JSON.stringify(history)}` },
    ]);
    return text || 'Na trego si do e qaseshe këtë rol në 90 ditët e para?';
  });
};

// ─────────────────────────────────────────────
// Answer Evaluation
// ─────────────────────────────────────────────

export const evaluateAnswer = async (
  career: string,
  question: string,
  answer: string,
): Promise<string> => {
  return withRetry(async () => {
    const text = await callModel([
      { role: 'system', content: 'Ti je intervistues dhe vlerësues. Jep feedback të shkurtër dhe praktik në shqip.' },
      { role: 'user', content: `Si intervistues për ${career}, vlerëso këtë përgjigje në shqip.\nFormat i detyrueshëm: [SCOR: X/10] Shpjegimi.\nQuestion: ${question}\nAnswer: ${answer}` },
    ]);
    return text || '[SCOR: 6/10] Përgjigjja ka bazë, por duhet më shumë shembuj praktikë dhe metrika.';
  });
};

// ─────────────────────────────────────────────
// Final Interview Evaluation
// ─────────────────────────────────────────────

export const evaluateFinalInterview = async (
  career: string,
  history: any[],
): Promise<InterviewVerdict> => {
  const fallback: InterviewVerdict = {
    hired: false,
    feedback: 'Performanca ishte premtuese, por duhen forcuar përgjigjet teknike dhe shembujt konkretë.',
  };

  return withRetry(async () => {
    if (GEMINI_API_KEY) {
      try {
        return await callGeminiStructured<InterviewVerdict>(
          `Analize performancën e plotë të intervistës për ${career} dhe kthe:
{"hired": true/false, "feedback": "feedback i detajuar në shqip"}
Historia: ${JSON.stringify(history)}`,
          {},
        );
      } catch (err) {
        console.warn('Gemini final eval failed, falling back to HF:', err);
      }
    }

    const text = await callModel([
      { role: 'system', content: 'Ti je menaxher punësimi. Vendos qartë nëse kandidati pranohet dhe jep feedback në shqip.' },
      { role: 'user', content: `Analizo performancën e plotë të intervistës për ${career}.\nKthe vetëm JSON valid:\n{"hired": true/false, "feedback": "..."}\nHistoria: ${JSON.stringify(history)}` },
    ]);

    return safeParse<InterviewVerdict>(text, fallback);
  });
};

// ─────────────────────────────────────────────
// General Assistant
// ─────────────────────────────────────────────

export const getAssistantResponse = async (
  userMessage: string,
  context?: string,
): Promise<string> => {
  return withRetry(async () => {
    const systemPrompt = `Ti je "Busulla AI", një career coach për tregun shqiptar. Gjithmonë përgjigju në shqip, profesional, i drejtpërdrejtë dhe praktik. Konteksti i përdoruesit: ${context || 'Këshilla të përgjithshme'}.`;

    if (GEMINI_API_KEY && geminiAI) {
      try {
        const prompt = `${systemPrompt}\n\nPërdoruesi: ${userMessage}`;
        const text = await callGemini(prompt, GEMINI_MODEL_FLASH);
        if (text.trim()) return text.trim();
      } catch (err) {
        console.warn('Gemini assistant failed, falling back to HF:', err);
      }
    }

    const text = await callModel(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      0.6,
    );

    return text || 'Më vjen keq, provo ta riformulosh pyetjen me më shumë detaje.';
  });
};

// ─────────────────────────────────────────────
// Dynamic Question Generation (Advanced Interview)
// ─────────────────────────────────────────────

export const generateDynamicQuestion = async (
  career: string,
  mode: InterviewMode,
  difficulty: DifficultyLevel,
  history: InterviewMessage[],
  weakAreas: string[] = [],
): Promise<{ question: string; type: 'technical' | 'behavioral'; hints: string[] }> => {
  return withRetry(async () => {
    const modeDescriptions = {
      [InterviewMode.TECHNICAL]:  'pyetje teknike specifike për fushën',
      [InterviewMode.BEHAVIORAL]: 'pyetje rreth përvojave dhe situatave të sjelljes',
      [InterviewMode.MIXED]:      'pyetje të përzier teknike dhe sjelljeore',
      [InterviewMode.STRESS]:     'pyetje sfiduese që testojnë reagimin nën presion',
    };
    const difficultyContext = {
      [DifficultyLevel.EASY]:   'Bazike, për ngrohje',
      [DifficultyLevel.MEDIUM]: 'Me intensitet mesatar, kërkon mendim',
      [DifficultyLevel.HARD]:   'Komplekse, kërkon thellësi dhe analitikë',
    };

    const historySummary = history
      .filter((m) => m.role === 'user')
      .slice(-3)
      .map((m) => m.content.substring(0, 100))
      .join(' | ');

    const prompt = `Je intervistues ekspert për pozicionin: ${career}
Lloji i intervistës: ${modeDescriptions[mode]}
Niveli i vështirësisë: ${difficultyContext[difficulty]}
${weakAreas.length > 0 ? `Fusha që duhen përmirësuar: ${weakAreas.join(', ')}` : ''}
Përgjigjet e fundit të kandidatit: ${historySummary || 'Asnjë ende'}

KTHE VETËM JSON VALID (pa \`\`\`json):
{
  "question": "Pyetja në shqip",
  "type": "technical ose behavioral",
  "hints": ["hint 1", "hint 2", "hint 3"]
}`;

    const text = await callModel(
      [
        { role: 'system', content: 'Ti je një intervistues profesional. Gjithmonë përgjigju me JSON valid në shqip.' },
        { role: 'user', content: prompt },
      ],
      0.7,
    );

    return safeParse(text, getFallbackQuestion(career, mode));
  });
};

function getFallbackQuestion(
  career: string,
  mode: InterviewMode,
): { question: string; type: 'technical' | 'behavioral'; hints: string[] } {
  const technicalQs = [
    { question: `Çfarë teknologjish ose mjetesh ke përdorur në ${career}?`, type: 'technical' as const, hints: ['Mendo për projektet e fundit', 'Përmend teknologjitë kryesore', 'Flit për rezultatet'] },
    { question: 'Si e qase një problem kompleks në punë?', type: 'technical' as const, hints: ['Përshkrua hap pas hapi', 'Çfarë vendimesh more?', 'Cili ishte rezultati?'] },
  ];
  const behavioralQs = [
    { question: 'Na trego për një sfidë që e ke kapërcyer në ekip.', type: 'behavioral' as const, hints: ['Çfarë ndodhi saktësisht?', 'Cili ishte roli yt?', 'Çfarë mësove?'] },
    { question: 'Si punon nën presion?', type: 'behavioral' as const, hints: ['Jep një shembull konkret', 'Si e menaxhon kohën?', 'Çfarë strategjish përdor?'] },
  ];
  const pool =
    mode === InterviewMode.BEHAVIORAL ? behavioralQs :
    mode === InterviewMode.TECHNICAL  ? technicalQs  :
    [...technicalQs, ...behavioralQs];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─────────────────────────────────────────────
// Detailed Answer Evaluation (Advanced Interview)
// ─────────────────────────────────────────────

export const evaluateAnswerWithFeedback = async (
  career: string,
  question: string,
  answer: string,
  mode: InterviewMode,
  difficulty: DifficultyLevel,
): Promise<InterviewFeedback> => {
  const fallback: InterviewFeedback = {
    score: 60,
    strengths: ['Përgjigjja është relevante'],
    improvements: ['Shto më shumë detaje dhe shembuj'],
    detailedFeedback: 'Përgjigjja ka bazë të mirë, por mund të thellohet me shembuj konkretë.',
    technicalAccuracy: 60,
    communication: 70,
    problemSolving: 55,
  };

  return withRetry(async () => {
    const prompt = `Si intervistues për ${career}, vlerëso këtë përgjigje.

Pyetja: ${question}
Përgjigjja: ${answer}
Lloji: ${mode}, Vështirësia: ${difficulty}

KTHE VETËM JSON VALID (pa \`\`\`json):
{
  "score": 75,
  "strengths": ["pika e fortë 1", "pika e fortë 2"],
  "improvements": ["përmirësim 1", "përmirësim 2"],
  "detailedFeedback": "Feedback i detajuar në shqip",
  "technicalAccuracy": 80,
  "communication": 70,
  "problemSolving": 75
}`;

    const text = await callModel(
      [
        { role: 'system', content: 'Ti je një vlerësues profesional intervistash. Jep feedback objektiv dhe konstruktiv.' },
        { role: 'user', content: prompt },
      ],
      0.5,
    );

    return safeParse<InterviewFeedback>(text, fallback);
  });
};

// ─────────────────────────────────────────────
// Adaptive Difficulty
// ─────────────────────────────────────────────

export const determineNextDifficulty = async (
  history: InterviewMessage[],
  currentDifficulty: DifficultyLevel,
): Promise<DifficultyLevel> => {
  if (history.filter((m) => m.role === 'user').length < 2) return currentDifficulty;

  const recentScores = history
    .filter((m) => m.role === 'user' && m.metadata?.feedback?.score)
    .slice(-3)
    .map((m) => m.metadata?.feedback?.score || 50);

  if (recentScores.length === 0) return currentDifficulty;

  const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  if (avg >= 75 && currentDifficulty !== DifficultyLevel.HARD) {
    return currentDifficulty === DifficultyLevel.EASY ? DifficultyLevel.MEDIUM : DifficultyLevel.HARD;
  }
  if (avg < 50 && currentDifficulty !== DifficultyLevel.EASY) {
    return currentDifficulty === DifficultyLevel.HARD ? DifficultyLevel.MEDIUM : DifficultyLevel.EASY;
  }

  return currentDifficulty;
};

// ─────────────────────────────────────────────
// Interview Report Generation
// ─────────────────────────────────────────────

export const generateInterviewReport = async (
  session: InterviewSession,
): Promise<InterviewReport> => {
  const answers = session.messages
    .filter((m) => m.role === 'user')
    .map((m, i) => {
      const question = session.messages.filter((m2) => m2.role === 'assistant')[i];
      return {
        question: question?.content || '',
        answer:   m.content,
        score:    m.metadata?.feedback?.score || 50,
        feedback: m.metadata?.feedback?.detailedFeedback || '',
      };
    });

  const categoryScores = { technical: 0, communication: 0, problemSolving: 0, cultureFit: 0 };
  let scoreCount = 0;

  session.messages
    .filter((m) => m.role === 'user' && m.metadata?.feedback)
    .forEach((m) => {
      const f = m.metadata!.feedback!;
      categoryScores.technical      += f.technicalAccuracy || f.score;
      categoryScores.communication  += f.communication     || f.score;
      categoryScores.problemSolving += f.problemSolving    || f.score;
      categoryScores.cultureFit     += (f.communication    || f.score) * 0.8;
      scoreCount++;
    });

  if (scoreCount > 0) {
    categoryScores.technical      = Math.round(categoryScores.technical      / scoreCount);
    categoryScores.communication  = Math.round(categoryScores.communication  / scoreCount);
    categoryScores.problemSolving = Math.round(categoryScores.problemSolving / scoreCount);
    categoryScores.cultureFit     = Math.round(categoryScores.cultureFit     / scoreCount);
  }

  const verdict =
    session.overallScore >= 70 ? 'hired' :
    session.overallScore >= 50 ? 'consider' : 'rejected';

  const summaryPrompt = `Gjenero raport interviste. Kthe VETËM JSON VALID (pa \`\`\`json):
{
  "summary": "Përmbledhje 2-3 fjali në shqip",
  "recommendations": ["rekomandim 1", "rekomandim 2"],
  "weakTopics": ["temë e dobët 1"],
  "practiceSuggestions": ["sugjerim 1", "sugjerim 2"]
}

Pozicioni: ${session.career}, Rezultati: ${session.overallScore}/100
Fusha të dobëta: ${session.weakAreas.join(', ') || 'Asnjë'}
Fusha të forta: ${session.strongAreas.join(', ') || 'Asnjë'}`;

  const fallbackReport = {
    summary: `Intervista përfundoi me rezultat ${session.overallScore}/100. ${verdict === 'hired' ? 'Kandidati tregon gatishmëri.' : verdict === 'consider' ? 'Ka potencial, por nevojiten përmirësime.' : 'Duhen më shumë përgatitje.'}`,
    recommendations: ['Praktikoni më shumë intervista', 'Thelloni njohuritë teknike'],
    weakTopics: session.weakAreas,
    practiceSuggestions: ['Mock interviews', 'Case studies'],
  };

  try {
    const text = await callModel(
      [
        { role: 'system', content: 'Ti je career coach që jep raporte profesionale intervistash në shqip.' },
        { role: 'user', content: summaryPrompt },
      ],
      0.6,
    );
    const aiReport = safeParse(text, fallbackReport);

    return {
      sessionId: session.id,
      career:    session.career,
      mode:      session.mode,
      overallScore: session.overallScore,
      verdict,
      summary:  aiReport.summary || fallbackReport.summary,
      categoryScores,
      answersReview: answers,
      recommendations:     aiReport.recommendations || fallbackReport.recommendations,
      weakTopics:          aiReport.weakTopics || fallbackReport.weakTopics,
      practiceSuggestions: aiReport.practiceSuggestions || fallbackReport.practiceSuggestions,
      duration: session.endTime ? session.endTime - session.startTime : 0,
    };
  } catch {
    return {
      sessionId: session.id,
      career:    session.career,
      mode:      session.mode,
      overallScore: session.overallScore,
      verdict,
      ...fallbackReport,
      categoryScores,
      answersReview: answers,
      duration: session.endTime ? session.endTime - session.startTime : 0,
    };
  }
};

// ─────────────────────────────────────────────
// Hint Generator
// ─────────────────────────────────────────────

export const getHint = async (
  question: string,
  career: string,
  hintsRemaining: number = 3,
): Promise<string> => {
  return withRetry(async () => {
    const text = await callModel(
      [
        { role: 'system', content: 'Ti je mentor që jep hints të dobishëm pa zbuluar përgjigjen. Përgjigju në shqip.' },
        { role: 'user', content: `Për pyetjen: "${question}" në kontekstin e karrierës ${career}, jep një hint të shkurtër që ndihmon kandidatin pa zbuluar përgjigjen.` },
      ],
      0.7,
    );
    return text || 'Mendo për përvojat tua të mëparshme dhe si mund të zbatohen këtu.';
  });
};

// ─────────────────────────────────────────────
// Career Chat Assistant
// ─────────────────────────────────────────────

export const getCareerAssistantResponse = async (
  message: string,
  chatHistory: ChatMessage[],
  userContext?: {
    careerPath?: string;
    quizResults?: string;
    weakAreas?: string[];
  },
): Promise<string> => {
  return withRetry(async () => {
    const recentHistory = chatHistory.slice(-6);
    const historyContext = recentHistory
      .map((m) => `${m.role === 'user' ? 'Përdoruesi' : 'Asistenti'}: ${m.content}`)
      .join('\n');

    const contextParts: string[] = [];
    if (userContext?.careerPath) contextParts.push(`Karriera e rekomanduar: ${userContext.careerPath}`);
    if (userContext?.weakAreas?.length) contextParts.push(`Fusha për përmirësim: ${userContext.weakAreas.join(', ')}`);

    const systemPrompt = `Ti je "Busulla AI", një asistent karriere 24/7 për tregun shqiptar.
Përgjigju në shqip, profesional dhe miqësor. Jep këshilla konkrete dhe praktike.
Konteksti: ${contextParts.join('\n') || 'Asnjë'}
Historia: ${historyContext || 'Bisedë e re'}`;

    const text = await callModel(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      0.6,
    );

    return text || 'Më vjen keq, nuk mund ta përpunoj këtë kërkesë tani. Provo përsëri!';
  });
};

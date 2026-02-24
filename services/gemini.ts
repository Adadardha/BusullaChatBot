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

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

type InterviewVerdict = { hired: boolean; feedback: string };

const HF_API_KEY =
  import.meta.env.VITE_HF_API_KEY ||
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.GEMINI_API_KEY;
const HF_MODEL =
  import.meta.env.VITE_HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
const HF_URL = 'https://router.huggingface.co/v1/chat/completions';

interface ChatMessageAPI {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

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

async function callModel(
  messages: ChatMessageAPI[],
  temperature = 0.4,
): Promise<string> {
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

async function enrichWithLLM(
  base: PredictionResult,
  answers: QuizAnswer[],
): Promise<PredictionResult> {
  const prompt = `Bazuar në këto përgjigje quiz karriere, shkruaj një paragraf të shkurtër (2-3 fjali) në shqip që shpjegon pse "${base.primaryCareer}" është karriera kryesore e rekomanduar. Mos shto tekst tjetër, vetëm paragrafi.
Përgjigjet: ${JSON.stringify(answers.map((a) => a.answer))}`;

  try {
    const text = await callModel([
      {
        role: 'system',
        content:
          'Ti je këshilltar karriere për tregun shqiptar. Jep përgjigje të shkurtra dhe profesionale.',
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

export const predictCareer = async (
  answers: QuizAnswer[],
): Promise<PredictionResult> => {
  const localResult = classifyToPrediction(answers);

  if (!HF_API_KEY) {
    return localResult;
  }

  return withRetry(() => enrichWithLLM(localResult, answers));
};

export const generateInterviewQuestion = async (
  career: string,
  history: any[],
  level: Difficulty,
): Promise<string> => {
  return withRetry(async () => {
    const text = await callModel([
      {
        role: 'system',
        content:
          'Ti je intervistues teknik. Gjithmonë përgjigju në shqip me pyetje të qarta.',
      },
      {
        role: 'user',
        content: `Ti je intervistues ekspert për ${career}. Niveli i vështirësisë: ${level}.\nBëj një pyetje të vetme, specifike për fushën.\nHistoria: ${JSON.stringify(history)}`,
      },
    ]);
    return (
      text || 'Na trego si do e qaseshe këtë rol në 90 ditët e para?'
    );
  });
};

export const evaluateAnswer = async (
  career: string,
  question: string,
  answer: string,
): Promise<string> => {
  return withRetry(async () => {
    const text = await callModel([
      {
        role: 'system',
        content:
          'Ti je intervistues dhe vlerësues. Jep feedback të shkurtër dhe praktik në shqip.',
      },
      {
        role: 'user',
        content: `Si intervistues për ${career}, vlerëso këtë përgjigje në shqip.\nFormat i detyrueshëm: [SCOR: X/10] Shpjegimi.\nQuestion: ${question}\nAnswer: ${answer}`,
      },
    ]);
    return (
      text ||
      '[SCOR: 6/10] Përgjigjja ka bazë, por duhet më shumë shembuj praktikë dhe metrika.'
    );
  });
};

export const evaluateFinalInterview = async (
  career: string,
  history: any[],
): Promise<InterviewVerdict> => {
  return withRetry(async () => {
    const text = await callModel([
      {
        role: 'system',
        content:
          'Ti je menaxher punësimi. Vendos qartë nëse kandidati pranohet dhe jep feedback në shqip.',
      },
      {
        role: 'user',
        content: `Analizo performancën e plotë të intervistës për ${career}.\nKthe vetëm JSON valid në formatin:\n{"hired": true/false, "feedback": "..."}\nHistoria: ${JSON.stringify(history)}`,
      },
    ]);

    return safeParse<InterviewVerdict>(text, {
      hired: false,
      feedback:
        'Performanca ishte premtuese, por duhen forcuar përgjigjet teknike dhe shembujt konkretë.',
    });
  });
};

export const getAssistantResponse = async (
  userMessage: string,
  context?: string,
): Promise<string> => {
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

    return (
      text ||
      'Më vjen keq, provo ta riformulosh pyetjen me më shumë detaje.'
    );
  });
};

// ============ NEW INTERVIEW SYSTEM FUNCTIONS ============

export const generateDynamicQuestion = async (
  career: string,
  mode: InterviewMode,
  difficulty: DifficultyLevel,
  history: InterviewMessage[],
  weakAreas: string[] = [],
): Promise<{ question: string; type: 'technical' | 'behavioral'; hints: string[] }> => {
  return withRetry(async () => {
    const modeDescriptions = {
      [InterviewMode.TECHNICAL]: 'pyetje teknike specifike për fushën',
      [InterviewMode.BEHAVIORAL]: 'pyetje rreth përvojave dhe situatave të sjelljes',
      [InterviewMode.MIXED]: 'pyetje të përzier teknike dhe sjelljeore',
      [InterviewMode.STRESS]: 'pyetje sfiduese që testojnë reagimin nën presion',
    };

    const difficultyContext = {
      [DifficultyLevel.EASY]: 'Bazike, për ngrohje',
      [DifficultyLevel.MEDIUM]: 'Me intensitet mesatar, kërkon mendim',
      [DifficultyLevel.HARD]: 'Komplekse, kërkon thellësi dhe analitikë',
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

KTHE VETËM JSON VALID:
{
  "question": "Pyetja në shqip (e qartë dhe koncize)",
  "type": "technical ose behavioral",
  "hints": ["hint 1 pa zbuluar përgjigjen", "hint 2", "hint 3"]
}`;

    const text = await callModel(
      [
        {
          role: 'system',
          content:
            'Ti je një intervistues profesional. Gjithmonë përgjigju me JSON valid në shqip.',
        },
        { role: 'user', content: prompt },
      ],
      0.7,
    );

    const fallbackQuestion = getFallbackQuestion(career, mode);
    return safeParse(text, fallbackQuestion);
  });
};

function getFallbackQuestion(
  career: string,
  mode: InterviewMode,
): { question: string; type: 'technical' | 'behavioral'; hints: string[] } {
  const technicalQs = [
    {
      question: `Çfarë teknologjish ose mjeteish ke përdorur në ${career}?`,
      type: 'technical' as const,
      hints: [
        'Mendo për projektet e fundit',
        'Përmend teknologjitë kryesore',
        'Flit për rezultatet',
      ],
    },
    {
      question: 'Si e qase një problem kompleks në punë?',
      type: 'technical' as const,
      hints: [
        'Përshkrua hap pas hapi',
        'Çfarë vendimesh more?',
        'Cili ishte rezultati?',
      ],
    },
  ];

  const behavioralQs = [
    {
      question: 'Na trego për një sfidë që e ke kapërcyer në ekip.',
      type: 'behavioral' as const,
      hints: [
        'Çfarë ndodhi saktësisht?',
        'Cili ishte roli yt?',
        'Çfarë mësove?',
      ],
    },
    {
      question: 'Si punon nën presion?',
      type: 'behavioral' as const,
      hints: [
        'Jep një shembull konkret',
        'Si e menaxhon kohën?',
        'Çfarë strategjish përdor?',
      ],
    },
  ];

  const allQuestions = mode === InterviewMode.BEHAVIORAL 
    ? behavioralQs 
    : mode === InterviewMode.TECHNICAL 
      ? technicalQs 
      : [...technicalQs, ...behavioralQs];

  return allQuestions[Math.floor(Math.random() * allQuestions.length)];
}

export const evaluateAnswerWithFeedback = async (
  career: string,
  question: string,
  answer: string,
  mode: InterviewMode,
  difficulty: DifficultyLevel,
): Promise<InterviewFeedback> => {
  return withRetry(async () => {
    const prompt = `Si intervistues për ${career}, vlerëso këtë përgjigje.

Pyetja: ${question}
Përgjigjja: ${answer}
Lloji i intervistës: ${mode}
Vështirësia: ${difficulty}

KTHE VETËM JSON VALID:
{
  "score": 0-100,
  "strengths": ["pika e fortë 1", "pika e fortë 2"],
  "improvements": ["përmirësim 1", "përmirësim 2"],
  "detailedFeedback": "Feedback i detajuar në shqip",
  "technicalAccuracy": 0-100,
  "communication": 0-100,
  "problemSolving": 0-100
}`;

    const text = await callModel(
      [
        {
          role: 'system',
          content:
            'Ti je një vlerësues profesional intervistash. Jep feedback objektiv dhe konstruktiv.',
        },
        { role: 'user', content: prompt },
      ],
      0.5,
    );

    return safeParse<InterviewFeedback>(text, {
      score: 60,
      strengths: ['Përgjigjja është relevante'],
      improvements: ['Shto më shumë detaje dhe shembuj'],
      detailedFeedback:
        'Përgjigjja ka bazë të mirë, por mund të thellohet më shumë me shembuj konkretë.',
      technicalAccuracy: 60,
      communication: 70,
      problemSolving: 55,
    });
  });
};

export const determineNextDifficulty = async (
  history: InterviewMessage[],
  currentDifficulty: DifficultyLevel,
): Promise<DifficultyLevel> => {
  if (history.filter((m) => m.role === 'user').length < 2) {
    return currentDifficulty;
  }

  const recentScores = history
    .filter((m) => m.role === 'user' && m.metadata?.feedback?.score)
    .slice(-3)
    .map((m) => m.metadata?.feedback?.score || 50);

  if (recentScores.length === 0) return currentDifficulty;

  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  if (avgScore >= 75 && currentDifficulty !== DifficultyLevel.HARD) {
    return currentDifficulty === DifficultyLevel.EASY
      ? DifficultyLevel.MEDIUM
      : DifficultyLevel.HARD;
  } else if (avgScore < 50 && currentDifficulty !== DifficultyLevel.EASY) {
    return currentDifficulty === DifficultyLevel.HARD
      ? DifficultyLevel.MEDIUM
      : DifficultyLevel.EASY;
  }

  return currentDifficulty;
};

export const generateInterviewReport = async (
  session: InterviewSession,
): Promise<InterviewReport> => {
  const answers = session.messages
    .filter((m) => m.role === 'user')
    .map((m, i) => {
      const question = session.messages.filter((m2) => m2.role === 'assistant')[i];
      return {
        question: question?.content || '',
        answer: m.content,
        score: m.metadata?.feedback?.score || 50,
        feedback: m.metadata?.feedback?.detailedFeedback || '',
      };
    });

  const categoryScores = {
    technical: 0,
    communication: 0,
    problemSolving: 0,
    cultureFit: 0,
  };

  let scoreCount = 0;
  session.messages
    .filter((m) => m.role === 'user' && m.metadata?.feedback)
    .forEach((m) => {
      const f = m.metadata!.feedback!;
      categoryScores.technical += f.technicalAccuracy || f.score;
      categoryScores.communication += f.communication || f.score;
      categoryScores.problemSolving += f.problemSolving || f.score;
      categoryScores.cultureFit += (f.communication || f.score) * 0.8;
      scoreCount++;
    });

  if (scoreCount > 0) {
    categoryScores.technical = Math.round(categoryScores.technical / scoreCount);
    categoryScores.communication = Math.round(
      categoryScores.communication / scoreCount,
    );
    categoryScores.problemSolving = Math.round(
      categoryScores.problemSolving / scoreCount,
    );
    categoryScores.cultureFit = Math.round(categoryScores.cultureFit / scoreCount);
  }

  const verdict =
    session.overallScore >= 70
      ? 'hired'
      : session.overallScore >= 50
        ? 'consider'
        : 'rejected';

  try {
    const summaryPrompt = `Gjenero një raport përfundimtar për intervistën.

Pozicioni: ${session.career}
Rezultati i përgjithshëm: ${session.overallScore}/100
Kategoria: Technical ${categoryScores.technical}%, Communication ${categoryScores.communication}%, Problem Solving ${categoryScores.problemSolving}%
Fusha të dobëta: ${session.weakAreas.join(', ') || 'Asnjë'}
Fusha të forta: ${session.strongAreas.join(', ') || 'Asnjë'}

KTHE VETËM JSON VALID:
{
  "summary": "Përmbledhje në 2-3 fjali në shqip",
  "recommendations": ["rekomandim 1", "rekomandim 2"],
  "weakTopics": ["temë e dobët 1", "temë e dobët 2"],
  "practiceSuggestions": ["sugjerim praktike 1", "sugjerim 2"]
}`;

    const text = await callModel(
      [
        {
          role: 'system',
          content:
            'Ti je një career coach që jep raporte profesionale intervistash në shqip.',
        },
        { role: 'user', content: summaryPrompt },
      ],
      0.6,
    );

    const aiReport = safeParse(text, {
      summary: `Intervista përfundoi me rezultat ${session.overallScore}/100. ${verdict === 'hired' ? 'Kandidati tregon gatishmëri për pozicionin.' : verdict === 'consider' ? 'Ka potencial, por nevojiten përmirësime.' : 'Duhen më shumë përgatitje.'}`,
      recommendations: ['Praktikoni më shumë intervista', 'The lloni njohuritë teknike'],
      weakTopics: session.weakAreas,
      practiceSuggestions: ['Mock interviews', 'Case studies'],
    });

    return {
      sessionId: session.id,
      career: session.career,
      mode: session.mode,
      overallScore: session.overallScore,
      verdict,
      summary: aiReport.summary,
      categoryScores,
      answersReview: answers,
      recommendations: aiReport.recommendations,
      weakTopics: aiReport.weakTopics,
      practiceSuggestions: aiReport.practiceSuggestions,
      duration: session.endTime ? session.endTime - session.startTime : 0,
    };
  } catch {
    return {
      sessionId: session.id,
      career: session.career,
      mode: session.mode,
      overallScore: session.overallScore,
      verdict,
      summary: `Intervista përfundoi me rezultat ${session.overallScore}/100.`,
      categoryScores,
      answersReview: answers,
      recommendations: ['Vazhdoni të praktikoni'],
      weakTopics: session.weakAreas,
      practiceSuggestions: ['Mock interviews'],
      duration: session.endTime ? session.endTime - session.startTime : 0,
    };
  }
};

export const getHint = async (
  question: string,
  career: string,
  hintsRemaining: number = 3,
): Promise<string> => {
  return withRetry(async () => {
    const text = await callModel(
      [
        {
          role: 'system',
          content:
            'Ti je një mentor që jep hints të dobishëm pa zbuluar përgjigjen e plotë. Përgjigju në shqip.',
        },
        {
          role: 'user',
          content: `Për pyetjen: "${question}" në kontekstin e karrierës ${career}, jep një hint të shkurtër që ndihmon kandidatin të kuptojë drejtimin e përgjigjes pa e zbuluar atë.`,
        },
      ],
      0.7,
    );

    return (
      text || 'Mendo për përvojat tua të mëparshme dhe si mund të zbatohen këtu.'
    );
  });
};

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
    if (userContext?.careerPath) {
      contextParts.push(`Karriera e rekomanduar: ${userContext.careerPath}`);
    }
    if (userContext?.weakAreas && userContext.weakAreas.length > 0) {
      contextParts.push(`Fusha për përmirësim: ${userContext.weakAreas.join(', ')}`);
    }

    const systemPrompt = `Ti je "Busulla AI", një asistent karriere 24/7 për tregun shqiptar.

KARAKTERISTIKAT TUAJA:
- I disponueshëm gjithmonë për këshilla karriere
- I njohur me tregun e punës në Shqipëri dhe Kosovë
- I specializuar në zhvillim profesional, CV, intervista, dhe zgjedhje karriere
- I drejtpërdrejtë, praktik dhe inkurajues

KONTEKSTI I PËRDORUESIT:
${contextParts.length > 0 ? contextParts.join('\n') : 'Asnjë kontekst specifik'}

HISTORIA E BISEDËS:
${historyContext || 'Bisedë e re'}

INSTRUKSIONET:
- Përgjigju në shqip, profesional dhe miqësor
- Jep këshilla konkrete dhe të zbatueshme
- Nëse pyetja është për CV, jep këshilla specifike
- Nëse pyetja ësshtë për intervistë, jep tips praktikë
- Nëse pyetja është e paqartë, kërko sqarime`;

    const text = await callModel(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      0.6,
    );

    return (
      text ||
      'Më vjen keq, nuk mund ta përpunoj këtë kërkesë tani. Provo përsëri!'
    );
  });
};

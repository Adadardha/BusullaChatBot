import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizAnswer, PredictionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Utility to handle retries for rate-limiting (429) errors.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED');
    if (retries > 0 && isRateLimit) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const predictCareer = async (answers: QuizAnswer[]): Promise<PredictionResult> => {
  const prompt = `Analyze the following career assessment responses in Albanian and provide the top 3 best-fit career paths.
  Responses: ${JSON.stringify(answers)}`;
  
  const careerMatchSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The name of the career in Albanian." },
      percentage: { type: Type.NUMBER, description: "Match percentage (0-100)." },
      description: { type: Type.STRING, description: "Short description in Albanian." },
      whyFit: { type: Type.STRING, description: "Explanation of alignment in Albanian." },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      growthAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
      salaryRange: { type: Type.STRING, description: "Estimated salary range." },
      education: { type: Type.ARRAY, items: { type: Type.STRING } },
      learningPath: {
        type: Type.OBJECT,
        properties: {
          courses: { type: Type.ARRAY, items: { type: Type.STRING } },
          resources: { type: Type.ARRAY, items: { type: Type.STRING } },
          timeline: { type: Type.STRING, description: "Estimated timeline." },
        },
        required: ["courses", "resources", "timeline"],
      },
    },
    required: ["title", "percentage", "description", "whyFit", "strengths", "growthAreas", "salaryRange", "education", "learningPath"],
  };

  return withRetry(async () => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primary: careerMatchSchema,
            alternatives: { type: Type.ARRAY, items: careerMatchSchema },
          },
          required: ["primary", "alternatives"],
        },
      },
    });

    const text = response.text?.trim() || "{}";
    return JSON.parse(text) as PredictionResult;
  });
};

export const generateInterviewQuestion = async (career: string, history: any[], level: 'EASY' | 'MEDIUM' | 'HARD'): Promise<string> => {
  return withRetry(async () => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are an expert interviewer for ${career}. Current level of difficulty: ${level}. 
      Ask one sharp, field-specific interview question in Albanian.
      History: ${JSON.stringify(history)}`,
    });
    return response.text?.trim() || "ERROR: Question generation failed.";
  });
};

export const evaluateAnswer = async (career: string, question: string, answer: string): Promise<string> => {
  return withRetry(async () => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `As an interviewer for ${career}, evaluate this answer in Albanian. 
      Format: [SCOR: X/10] Shpjegimi.
      Question: ${question}
      Answer: ${answer}`,
    });
    return response.text?.trim() || "ERROR: Evaluation failed.";
  });
};

export const evaluateFinalInterview = async (career: string, history: any[]): Promise<{ hired: boolean, feedback: string }> => {
  return withRetry(async () => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze the full interview performance for ${career} and determine if the candidate is hired.
      History: ${JSON.stringify(history)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hired: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING, description: "Detailed summary in Albanian explaining why or why not, and what to improve." }
          },
          required: ["hired", "feedback"]
        }
      }
    });
    const text = response.text?.trim() || "{}";
    return JSON.parse(text);
  });
};

export const getAssistantResponse = async (userMessage: string, context?: string): Promise<string> => {
  return withRetry(async () => {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are "Busulla AI", an expert career coach for the Albanian market. 
        Always respond in Albanian. Be professional, direct (brutalist), and highly helpful.
        User context (if applicable): ${context || 'General advice'}.`,
      }
    });
    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "Më vjen keq, nuk munda të përpunoj këtë kërkesë.";
  });
};

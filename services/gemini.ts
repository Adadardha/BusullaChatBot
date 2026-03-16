import { GoogleGenAI } from "@google/genai";
import { PredictionResult, CareerMatch } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const withRetry = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
};

export const predictCareer = async (answers: any[]): Promise<PredictionResult> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analizo këto përgjigje të kuizit të orientimit në karrierë dhe sugjero karrierën ideale në tregun shqiptar: ${JSON.stringify(answers)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            primary: {
              type: "object",
              properties: {
                title: { type: "string" },
                percentage: { type: "number" },
                description: { type: "string" },
                whyFit: { type: "string" },
                salaryRange: { type: "string" },
                education: { type: "array", items: { type: "string" } },
                learningPath: {
                  type: "object",
                  properties: {
                    courses: { type: "array", items: { type: "string" } },
                    resources: { type: "array", items: { type: "string" } },
                    timeline: { type: "string" }
                  }
                }
              }
            },
            alternatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  percentage: { type: "number" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text);
  });
};

export const getAssistantResponse = async (userMessage: string, career?: string): Promise<string> => {
  const hfToken = process.env.VITE_HF_API_KEY || (import.meta as any).env?.VITE_HF_API_KEY;
  const hfModel = process.env.VITE_HF_MODEL || (import.meta as any).env?.VITE_HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.3";

  if (hfToken) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${hfModel}`,
        {
          headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({
            inputs: `<s>[INST] Ti je "Busulla AI", një trajner karriere ekspert për tregun shqiptar. Përgjigju gjithmonë në shqip. Je profesional, i drejtpërdrejtë (brutalist) dhe shumë ndihmues. Konteksti i përdoruesit: ${career || 'Këshilla të përgjithshme'}. Pyetja: ${userMessage} [/INST]`,
          }),
        }
      );
      const result = await response.json();
      if (result && result[0] && result[0].generated_text) {
        const text = result[0].generated_text;
        const parts = text.split('[/INST]');
        return parts[parts.length - 1].trim();
      }
    } catch (error) {
      console.error("Hugging Face Error:", error);
    }
  }

  return withRetry(async () => {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are "Busulla AI", an expert career coach for the Albanian market. 
        Always respond in Albanian. Be professional, direct (brutalist), and highly helpful.
        User context (if applicable): ${career || 'General advice'}.`,
      }
    });
    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "Më vjen keq, nuk munda të përpunoj këtë kërkesë.";
  });
};

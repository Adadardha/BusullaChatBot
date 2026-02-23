
export enum AppState {
  LANDING = 'LANDING',
  QUIZ = 'QUIZ',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  INTERVIEW = 'INTERVIEW'
}

export interface QuizAnswer {
  questionId: number;
  answer: string;
  isCustom: boolean;
}

export interface AlternativeCareer {
  career: string;
  confidence: number;
  description: string;
}

export interface PredictionResult {
  primaryCareer: string;
  confidence: number;
  description: string;
  alternatives: AlternativeCareer[];
  learningPath: string[];
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  category: string;
}

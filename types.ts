
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

export interface CareerMatch {
  title: string;
  percentage: number;
  description: string;
  whyFit: string;
  strengths: string[];
  growthAreas: string[];
  salaryRange: string;
  education: string[];
  learningPath: {
    courses: string[];
    resources: string[];
    timeline: string;
  };
}

export interface PredictionResult {
  primary: CareerMatch;
  alternatives: CareerMatch[];
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  category: string;
}

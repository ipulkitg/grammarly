export interface SpellingFix {
  wrong: string;
  suggestions: string[];
}

export interface GrammarFixResponse {
  spellingFixes: SpellingFix[];
  grammarIssues: [string, number, string][];
  unclearTokens: string[];
  rewrite: string;
}

export interface FullCoachResponse {
  tone: string;
  outline: string[];
  repetition: { word: string; count: number; suggestions: string[] }[];
  clarityPrompts: string[];
  trimSuggestions: string[];
  coachPerspective: string[];
  checklist: {
    goalsClear: boolean;
    collegeFit: boolean;
    personalVoice: boolean;
  };
}

export interface EssayMetadata {
  program: string;
  wordLimit: number;
  deadline: string;
  goals: {
    short: string;
    long: string;
  };
  motivator: string;
  programFitReasons: Array<{
    aspect: string;
    reason: string;
  }>;
  anecdotes: Array<{
    story: string;
    purpose: string;
  }>;
  keywords: string[];
  obstacles: Array<{
    description: string;
    resolution: string;
  }>;
} 
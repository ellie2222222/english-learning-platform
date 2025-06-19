export interface IAIService {
  askEnglishTutorAI: (prompt: string) => Promise<string>;
  getPersonalizeLearningRecommendation: (
    userId: string,
    requesterId: string
  ) => Promise<{
    referenceData: object[];
    response: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      summary: string;
    };
  }>;
}

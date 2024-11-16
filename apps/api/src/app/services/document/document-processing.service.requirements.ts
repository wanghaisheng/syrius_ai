export interface RelevantDocument {
  text: string;
  score: number;
}

export interface IDocumentProcessingService {
  calculateAverageScore(docs: RelevantDocument[]): number;
  combineContext(docs: RelevantDocument[]): string[];
}

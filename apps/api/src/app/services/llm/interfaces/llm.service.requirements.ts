export interface ILLMService {
  askQuestion(
    question: string,
    context: string[],
    contextIsRelevant: boolean
  ): Promise<string>;
}

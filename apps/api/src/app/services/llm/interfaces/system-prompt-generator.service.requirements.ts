export interface ISystemPromptGenerator {
  generatePrompt(context: string[], question: string): string;
}

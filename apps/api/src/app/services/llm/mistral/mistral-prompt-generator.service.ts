import { Injectable } from '@nestjs/common';
import { ISystemPromptGenerator } from '../interfaces/system-prompt-generator.service.requirements';

// ROP: Prompt engineering is required to refine the results.
// This is a basic version which will be improved very soon.

@Injectable()
export class MistralPromptGeneratorService implements ISystemPromptGenerator {
  generatePrompt(context: string[], question: string): string {
    const formattedContext = context.join('\n');
    return `
      You are using the Mistral AI system.
      Relevant context:
      ${formattedContext}

      Please answer the question based on the above context. If the context is incomplete, reply: "Not enough information to provide an answer."

      Question: ${question}
      Answer:`;
  }
}

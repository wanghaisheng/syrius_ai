import { Injectable } from '@nestjs/common';
import { ISystemPromptGenerator } from '../interfaces/system-prompt-generator.service.requirements';

// ROP: Prompt engineering is required to refine the results.
// This is a basic version which will be improved very soon.

@Injectable()
export class OpenAIPromptGeneratorService implements ISystemPromptGenerator {
  generatePrompt(context: string[], question: string): string {
    const formattedContext = context.join('\n');
    return `
      You are an OpenAI-powered assistant with vast knowledge.
      Here is the relevant context:
      ${formattedContext}

      Please answer the following question. If the context is insufficient, respond with: "I don't have enough information to answer this question."

      Question: ${question}
      Answer:`;
  }
}

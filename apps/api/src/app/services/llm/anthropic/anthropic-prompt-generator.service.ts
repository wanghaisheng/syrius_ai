import { Injectable } from '@nestjs/common';
import { ISystemPromptGenerator } from '../interfaces/system-prompt-generator.service.requirements';

// ROP: Prompt engineering is required to refine the results.
// This is a basic version which will be improved very soon.

@Injectable()
export class AnthropicPromptGeneratorService implements ISystemPromptGenerator {
  generatePrompt(context: string[], question: string): string {
    const formattedContext = context.join('\n');
    return `
      You are an Anthropic-powered assistant trained to provide clear and concise answers.
      Context:
      ${formattedContext}

      Based on the above context, answer the question below. If insufficient context is available, say: "I lack sufficient context to answer."

      Question: ${question}
      Answer:`;
  }
}

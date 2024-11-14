import { Injectable } from '@nestjs/common';
import { ILLMService } from './llm.service.requirements';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

@Injectable()
export class LLMService implements ILLMService {
  constructor(private readonly llm: BaseChatModel) {}

  public async askQuestion(
    question: string,
    context: string[],
    contextIsRelevant: boolean
  ): Promise<string> {
    if (!contextIsRelevant) {
      return 'Unfortunately, no context-specific information was found.';
    }

    const prompt = this.createPrompt(context, question);
    const response = await this.invokeLLM(prompt);
    return this.extractResponseText(response);
  }

  private createPrompt(context: string[], question: string): string {
    const formattedContext = context.join('\n');
    return `Context:\n${formattedContext}\n\nQuestion: ${question}\nAnswer:`;
  }

  private async invokeLLM(prompt: string): Promise<any> {
    try {
      const response = await this.llm.invoke(prompt);
      return response;
    } catch (error: any) {
      throw new Error(`LLM invocation failed: ${error.message}`);
    }
  }

  private extractResponseText(response: any): string {
    if (typeof response === 'string') {
      return response;
    } else if (Array.isArray(response)) {
      return response
        .map((item) => (typeof item === 'string' ? item : item.text))
        .join(' ');
    } else if (typeof response === 'object' && response !== null) {
      if (response.text) {
        return response.text;
      }
    }
    throw new Error('Unexpected response format from LLM');
  }
}

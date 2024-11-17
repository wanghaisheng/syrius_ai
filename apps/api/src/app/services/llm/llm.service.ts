import { Injectable } from '@nestjs/common';
import { ILLMService } from './llm.service.requirements';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

type LLMResponse = { text: string } | string | Array<{ text: string } | string>;

@Injectable()
export class GeneralLLMService implements ILLMService {
  constructor(
    private readonly llm: BaseChatModel
  ) // private readonly systemPromptGenerator: ISystemPromptGenerator // This is a future requirement
  {}

  public async askQuestion(
    question: string,
    context: string[],
    contextIsRelevant: boolean
  ): Promise<string> {
    if (!contextIsRelevant || context.length === 0) {
      return 'Unfortunately, no relevant context was found to answer your question.';
    }

    const prompt = this.createPrompt(context, question);
    const response = await this.invokeLLM(prompt);
    return this.extractResponseText(response);
  }

  private createPrompt(context: string[], question: string): string {
    const formattedContext = context.join('\n');
    return `
      You are a highly knowledgeable assistant.
      The following is the relevant context extracted from our knowledge base:
      ${formattedContext}

      Based on this context, answer the following question.
      If the context is insufficient or unrelated, respond with: "The context provided does not contain enough information to answer this question."

      Question: ${question}
      Answer:`;
  }

  private async invokeLLM(prompt: string): Promise<LLMResponse> {
    try {
      const response = await this.llm.invoke(prompt);
      return response;
    } catch (error) {
      throw new Error(`LLM invocation failed: ${error.message}`);
    }
  }

  private extractResponseText(response: LLMResponse): string {
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

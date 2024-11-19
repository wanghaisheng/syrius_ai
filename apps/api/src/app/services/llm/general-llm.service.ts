import { Inject, Injectable } from '@nestjs/common';
import { ILLMService } from './interfaces/llm.service.requirements';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ISystemPromptGenerator } from './interfaces/system-prompt-generator.service.requirements';

type LLMResponse = { text: string } | string | Array<{ text: string } | string>;

@Injectable()
export class GeneralLLMService implements ILLMService {
  constructor(
    private readonly llm: BaseChatModel,
    @Inject('ISystemPromptGenerator')
    private readonly promptGenerator: ISystemPromptGenerator
  ) {}

  public async askQuestion(
    question: string,
    context: string[],
    contextIsRelevant: boolean
  ): Promise<string> {
    if (!contextIsRelevant || context.length === 0) {
      return 'Unfortunately, no relevant context was found to answer your question.';
    }

    const prompt = this.promptGenerator.generatePrompt(context, question);
    const response = await this.invokeLLM(prompt);
    return this.extractResponseText(response);
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

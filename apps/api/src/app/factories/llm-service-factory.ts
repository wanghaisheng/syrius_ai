import { Inject, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatMistralAI } from '@langchain/mistralai';
import {
  anthropicConfiguration,
  mistralConfiguration,
  openAIConfiguration,
} from '../config/llm.config';
import { GeneralLLMService } from '../services/llm/general-llm.service';
import { ILLMService } from '../services/llm/interfaces/llm.service.requirements';
import { ILLMServiceFactory } from './llm-service-factory.requirements';
import { ISystemPromptGenerator } from '../services/llm/interfaces/system-prompt-generator.service.requirements';

@Injectable()
export class LLMServiceFactory implements ILLMServiceFactory {
  constructor(
    @Inject('IOpenAIPromptGenerator')
    private readonly openAIPromptGenerator: ISystemPromptGenerator,
    @Inject('IAnthropicPromptGenerator')
    private readonly anthropicPromptGenerator: ISystemPromptGenerator,
    @Inject('IMistralPromptGenerator')
    private readonly mistralPromptGenerator: ISystemPromptGenerator
  ) {}

  create(model: 'openai' | 'anthropic' | 'mistral'): ILLMService {
    switch (model) {
      case 'openai':
        return new GeneralLLMService(
          new ChatOpenAI(openAIConfiguration),
          this.openAIPromptGenerator
        );
      case 'anthropic':
        return new GeneralLLMService(
          new ChatAnthropic(anthropicConfiguration),
          this.anthropicPromptGenerator
        );
      case 'mistral':
        return new GeneralLLMService(
          new ChatMistralAI(mistralConfiguration),
          this.mistralPromptGenerator
        );
      default:
        throw new Error(`Model not supported: ${model}`);
    }
  }
}

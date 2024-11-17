import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatMistralAI } from '@langchain/mistralai';
import {
  anthropicConfiguration,
  mistralConfiguration,
  openAIConfiguration,
} from '../config/llm.config';
import { ILLMServiceFactory } from './llm-service-factory.requirements';
import { ILLMService } from '../services/llm/llm.service.requirements';
import { GeneralLLMService } from '../services/llm/llm.service';

@Injectable()
export class LLMServiceFactory implements ILLMServiceFactory {
  create(model: 'openai' | 'anthropic' | 'mistral'): ILLMService {
    switch (model) {
      case 'openai':
        return new GeneralLLMService(new ChatOpenAI(openAIConfiguration));
      case 'anthropic':
        return new GeneralLLMService(new ChatAnthropic(anthropicConfiguration));
      case 'mistral':
        return new GeneralLLMService(new ChatMistralAI(mistralConfiguration));
      default:
        throw new Error(`Model not supported: ${model}`);
    }
  }
}

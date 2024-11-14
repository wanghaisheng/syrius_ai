import { Injectable } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatMistralAI } from '@langchain/mistralai';
import {
  anthropicConfiguration,
  mistralConfiguration,
  openAIConfiguration,
} from '../config/llm.config';
import { ILLMServiceFactory } from './llm-service-factory.requirements';

@Injectable()
export class LLMServiceFactory implements ILLMServiceFactory {
  create(model: 'openai' | 'anthropic' | 'mistral'): BaseChatModel {
    switch (model) {
      case 'openai':
        return new ChatOpenAI(openAIConfiguration);
      case 'anthropic':
        return new ChatAnthropic(anthropicConfiguration);
      case 'mistral':
        return new ChatMistralAI(mistralConfiguration);
      default:
        throw new Error(`Model not supported: ${model}`);
    }
  }
}

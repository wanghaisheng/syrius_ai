import { LLMServiceFactory } from './llm-service-factory';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatMistralAI } from '@langchain/mistralai';
import {
  openAIConfiguration,
  anthropicConfiguration,
  mistralConfiguration,
} from '../config/llm.config';

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn(),
}));

jest.mock('@langchain/anthropic', () => ({
  ChatAnthropic: jest.fn(),
}));

jest.mock('@langchain/mistralai', () => ({
  ChatMistralAI: jest.fn(),
}));

describe('The LLMServiceFactory', () => {
  let factory: LLMServiceFactory;

  beforeEach(() => {
    factory = new LLMServiceFactory();
  });

  describe('The create method', () => {
    it('should create an instance of ChatOpenAI when model is "openai"', () => {
      const model = 'openai';
      const instance = factory.create(model);

      expect(ChatOpenAI).toHaveBeenCalledWith(openAIConfiguration);
      expect(instance).toBeInstanceOf(ChatOpenAI);
    });

    it('should create an instance of ChatAnthropic when model is "anthropic"', () => {
      const model = 'anthropic';
      const instance = factory.create(model);

      expect(ChatAnthropic).toHaveBeenCalledWith(anthropicConfiguration);
      expect(instance).toBeInstanceOf(ChatAnthropic);
    });

    it('should create an instance of ChatMistralAI when model is "mistral"', () => {
      const model = 'mistral';
      const instance = factory.create(model);

      expect(ChatMistralAI).toHaveBeenCalledWith(mistralConfiguration);
      expect(instance).toBeInstanceOf(ChatMistralAI);
    });

    it('should throw an error for unsupported models', () => {
      const unsupportedModel = 'unsupported' as string as unknown as
        | 'openai'
        | 'anthropic'
        | 'mistral';

      expect(() => factory.create(unsupportedModel)).toThrow(
        'Model not supported: unsupported'
      );
    });
  });
});

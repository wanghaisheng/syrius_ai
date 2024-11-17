import { ILLMService } from '../services/llm/llm.service.requirements';

export interface ILLMServiceFactory {
  create(model: 'openai' | 'anthropic' | 'mistral'): ILLMService;
}

import { ILLMService } from '../services/llm/interfaces/llm.service.requirements';

export interface ILLMServiceFactory {
  create(model: 'openai' | 'anthropic' | 'mistral'): ILLMService;
}

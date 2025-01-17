import { ThirdPartyAPIKeyService } from './third-party-api-key.config';

const thirdPartyApiKeyService = new ThirdPartyAPIKeyService();

export const openAIConfiguration = {
  openAIApiKey: thirdPartyApiKeyService.getOpenAIApiKey() || '',
  model: 'gpt-4o-mini',
  temperature: 0,
  maxTokens: 1250,
  timeout: 10000,
  maxRetries: 2,
};

export const anthropicConfiguration = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'claude-3-5-haiku-20241022',
  temperature: 0.7,
  maxTokens: 1250,
  timeout: 5000,
  maxRetries: 2,
};

export const mistralConfiguration = {
  mistralApiKey: thirdPartyApiKeyService.getMistralApiKey() || '',
  model: 'open-mistral-7b',
  temperature: 0.5,
  maxTokens: 1250,
  timeout: 5000,
  maxRetries: 2,
};

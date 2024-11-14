export const openAIConfiguration = {
  openAIApiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4o-mini',
  temperature: 0,
  maxTokens: 1250,
  timeout: 10000,
  maxRetries: 2,
};

// ROP: This configuration is not fonctional for the moment.
// It is necessary to generate a new API key to use the service.
export const anthropicConfiguration = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'claude-2',
  temperature: 0.7,
  maxTokens: 1250,
  timeout: 5000,
  maxRetries: 2,
};

export const mistralConfiguration = {
  mistralApiKey: process.env.MISTRAL_API_KEY || '',
  model: 'open-mistral-7b',
  temperature: 0.5,
  maxTokens: 1250,
  timeout: 5000,
  maxRetries: 2,
};

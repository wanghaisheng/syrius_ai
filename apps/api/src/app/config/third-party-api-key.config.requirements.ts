export interface IThirdPartyAPIKeyService {
  getAnthropicApiKey(): string;
  getMistralApiKey(): string;
  getOpenAIApiKey(): string;
  getPineconeApiKey(): string;
}

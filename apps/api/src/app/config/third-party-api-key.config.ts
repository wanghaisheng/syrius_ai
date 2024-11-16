import { Injectable } from '@nestjs/common';
import { IThirdPartyAPIKeyService } from './third-party-api-key.config.requirements';

@Injectable()
export class ThirdPartyAPIKeyService implements IThirdPartyAPIKeyService {
  public getAnthropicApiKey(): string {
    return process.env.ANTHROPIC_API_KEY || '';
  }

  public getMistralApiKey(): string {
    return process.env.MISTRAL_API_KEY || '';
  }

  public getOpenAIApiKey(): string {
    return process.env.OPENAI_API_KEY || '';
  }

  public getPineconeApiKey(): string {
    return process.env.PINECONE_API_KEY || '';
  }
}

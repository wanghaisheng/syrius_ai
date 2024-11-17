import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ModelType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  MISTRAL = 'mistral',
}

export class AskBody {
  @IsEnum(ModelType)
  @IsNotEmpty()
  public model: ModelType = ModelType.OPENAI;

  @IsNotEmpty()
  @IsString()
  public question: string;
}

export class AskResponse {
  public answer: string;
}

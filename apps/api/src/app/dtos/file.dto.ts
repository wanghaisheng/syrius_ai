import { IsNotEmpty, IsString } from 'class-validator';

export class File {
  @IsNotEmpty()
  public buffer: Buffer;

  @IsString()
  public originalname: string;
}

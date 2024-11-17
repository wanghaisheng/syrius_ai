import { IsNotEmpty } from 'class-validator';

export class File {
  @IsNotEmpty()
  public buffer: Buffer;

  public originalname: string;
}

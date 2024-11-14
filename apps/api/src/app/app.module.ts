import { Module } from '@nestjs/common';
import { FileModule } from './modules/file.module';

@Module({
  imports: [FileModule],
})
export class AppModule {}

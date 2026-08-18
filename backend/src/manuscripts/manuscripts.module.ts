import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { ManuscriptsController } from './manuscripts.controller';
import { ManuscriptsService } from './manuscripts.service';

@Module({
  imports: [FilesModule],
  controllers: [ManuscriptsController],
  providers: [ManuscriptsService],
})
export class ManuscriptsModule {}

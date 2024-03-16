import { Module } from '@nestjs/common';
import { WagesController } from './wages.controller';
import { WagesService } from './wages.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WagesController],
  providers: [WagesService],
})
export class WagesModule {}

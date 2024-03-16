import { Module } from '@nestjs/common';
import { WagesController } from './wages.controller';
import { WagesService } from './wages.service';
import { DatabaseModule } from '../database/database.module';
import { CurrencyRatesRepository } from './currency-rates.repository';
import { EmployeeDataRepository } from './employee-data.repository';
import { AccessRequestRepository } from './access-request.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [WagesController],
  providers: [
    WagesService,
    EmployeeDataRepository,
    CurrencyRatesRepository,
    AccessRequestRepository,
  ],
})
export class WagesModule {}

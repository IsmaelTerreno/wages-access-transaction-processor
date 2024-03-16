import { Module } from '@nestjs/common';
import { WagesController } from './controller/wages.controller';
import { WagesService } from './service/wages.service';
import { DatabaseModule } from '../database/database.module';
import { CurrencyRatesRepository } from './repository/currency-rates.repository';
import { EmployeeDataRepository } from './repository/employee-data.repository';
import { AccessRequestRepository } from './repository/access-request.repository';

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

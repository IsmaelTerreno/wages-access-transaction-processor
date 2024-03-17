import { DataSource } from 'typeorm';

import { DATA_SOURCE } from '../../database/database.providers';
import { CurrencyRate } from '../entity/currency-rate.entity';

export const CURRENCY_RATES_REPOSITORY = 'CURRENCY_RATES_REPOSITORY';
export const CurrencyRatesRepository = {
  provide: CURRENCY_RATES_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(CurrencyRate),
  inject: [DATA_SOURCE],
};

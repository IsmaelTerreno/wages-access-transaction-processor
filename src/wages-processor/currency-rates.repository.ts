import { DataSource } from 'typeorm';

import { DATA_SOURCE } from '../database/database.providers';
import { CurrencyRates } from './currency-rates.entity';

export const CURRENCY_RATES_REPOSITORY = 'CURRENCY_RATES_REPOSITORY';
export const CurrencyRatesRepository = {
  provide: CURRENCY_RATES_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(CurrencyRates),
  inject: [DATA_SOURCE],
};

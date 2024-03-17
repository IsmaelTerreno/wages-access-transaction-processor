import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { WagesModule } from '../src/wages-processor/wages.module';
import { EMPLOYEE_DATA_REPOSITORY } from '../src/wages-processor/repository/employee-data.repository';
import { CURRENCY_RATES_REPOSITORY } from '../src/wages-processor/repository/currency-rates.repository';
import { ACCESS_REQUEST_REPOSITORY } from '../src/wages-processor/repository/access-request.repository';
import * as sampleData from '../test/utils/sample_wage_data.json';
import { AccessRequest } from '../src/wages-processor/entity/access-request.entity';
import { CurrencyRate } from '../src/wages-processor/entity/currency-rate.entity';
import { EmployeeData } from '../src/wages-processor/entity/employee-data.entity';

describe('Wages API (e2e)', () => {
  let app: INestApplication;

  /**
   * Load initial data for testing purposes, also will clean up the database data so take care when using it and should not be used in production.
   * @param wageAccessRequestRepository
   * @param employeeWageDataRepository
   * @param currencyRatesRepository
   */
  async function initializeDatabase(
    wageAccessRequestRepository: any,
    employeeWageDataRepository: any,
    currencyRatesRepository: any,
  ) {
    // Clean up database data first. This is for testing purposes only and should not be used in production.
    await wageAccessRequestRepository.delete({});
    await employeeWageDataRepository.delete({});
    await currencyRatesRepository.delete({});
    // Read file json sample_wage_data.json
    const employeeList: EmployeeData[] = sampleData.employeeWageData.map(
      (employeeData) => {
        return {
          id: undefined,
          employeeID: employeeData.employeeID,
          totalEarnedWages: employeeData.totalEarnedWages,
          totalAvailableForAccessRequest: employeeData.totalEarnedWages,
          currency: employeeData.currency,
          wageAccessRequest: [],
        };
      },
    );
    const currencyRates: CurrencyRate[] = Object.keys(
      sampleData.currencyRates,
    ).map((currency) => {
      return {
        id: undefined,
        conversionType: currency,
        exchangeRate: sampleData.currencyRates[currency],
      };
    });
    const accessRequestsList: AccessRequest[] =
      sampleData.wageAccessRequests.map((accessRequest) => {
        return {
          id: undefined,
          requestID: accessRequest.requestID,
          employeeID: accessRequest.employeeID,
          requestedAmount: accessRequest.requestedAmount,
          requestedCurrency: accessRequest.requestedCurrency,
          employeeWageData: undefined,
        };
      });
    for (const currencyRate of currencyRates) {
      const savedCurrencyRate = await currencyRatesRepository.save(
        currencyRate,
      );
      console.log('Saved currency rate:', savedCurrencyRate);
    }
    for (const employee of employeeList) {
      const savedEmployee = await employeeWageDataRepository.save(employee);
      const accessRequests = accessRequestsList.filter(
        (wageAccessRequest) =>
          wageAccessRequest.employeeID === employee.employeeID,
      );
      for (const accessRequest of accessRequests) {
        accessRequest.employeeWageData = savedEmployee;
        const savedAccessRequest = await wageAccessRequestRepository.save(
          accessRequest,
        );
        console.log('Saved wage access request:', savedAccessRequest);
      }
      console.log('Saved employee:', savedEmployee);
    }
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WagesModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const employeeWageDataRepository = moduleFixture.get(
      EMPLOYEE_DATA_REPOSITORY,
    );
    const currencyRatesRepository = moduleFixture.get(
      CURRENCY_RATES_REPOSITORY,
    );
    const wageAccessRequestRepository = moduleFixture.get(
      ACCESS_REQUEST_REPOSITORY,
    );
    await initializeDatabase(
      wageAccessRequestRepository,
      employeeWageDataRepository,
      currencyRatesRepository,
    );
  });

  it('/ (GET)', () => {
    //
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

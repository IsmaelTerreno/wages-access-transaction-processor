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
import { Repository } from 'typeorm';
import { BASE_PATH_WAGES_PROCESSOR } from '../src/wages-processor/controller/wages.controller';
// Jest timeout is 5 seconds by default, so we need to increase it to 30 seconds to avoid timeout errors.
jest.setTimeout(30000);
describe('Wages API (e2e)', () => {
  let app: INestApplication;

  /**
   * Load initial data for testing purposes, also will clean up the database data so take care when using it and should not be used in production.
   * @param wageAccessRequestRepository
   * @param employeeWageDataRepository
   * @param currencyRatesRepository
   */
  async function initializeDatabase(
    wageAccessRequestRepository: Repository<any>,
    employeeWageDataRepository: Repository<any>,
    currencyRatesRepository: Repository<any>,
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
      await currencyRatesRepository.save(currencyRate);
    }
    for (const employee of employeeList) {
      const savedEmployee = await employeeWageDataRepository.save(employee);
      const accessRequests = accessRequestsList.filter(
        (wageAccessRequest) =>
          wageAccessRequest.employeeID === employee.employeeID,
      );
      for (const accessRequest of accessRequests) {
        accessRequest.employeeWageData = savedEmployee;
        await wageAccessRequestRepository.save(accessRequest);
      }
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

  it('Should create one access request for one existing employee', () => {
    const accessRequest = {
      requestID: 'R04',
      employeeID: 'E01',
      requestedAmount: 1000,
      requestedCurrency: 'ARS',
    };
    return request(app.getHttpServer())
      .post(BASE_PATH_WAGES_PROCESSOR + '/access-request')
      .send(accessRequest)
      .then((result) => {
        expect(result.statusCode).toEqual(201);
      });
  });

  it('Should create one access request and see the affected available balance', () => {
    const accessRequest = {
      requestID: 'R04',
      employeeID: 'E01',
      requestedAmount: 1000,
      requestedCurrency: 'ARS',
    };
    return request(app.getHttpServer())
      .post(BASE_PATH_WAGES_PROCESSOR + '/access-request')
      .send(accessRequest)
      .then((result) => {
        expect(result.statusCode).toEqual(201);
        expect(result.body.data.requestedAmount).toEqual(1000);
        expect(
          result.body.data.employeeWageData.totalAvailableForAccessRequest,
        ).toEqual(1190);
      });
  });

  it('Should create 3 access request and see the affected available balance', async () => {
    const accessRequest = {
      requestID: 'R04',
      employeeID: 'E01',
      requestedAmount: 1000,
      requestedCurrency: 'ARS',
    };
    await request(app.getHttpServer())
      .post(BASE_PATH_WAGES_PROCESSOR + '/access-request')
      .send(accessRequest);
    await request(app.getHttpServer())
      .post(BASE_PATH_WAGES_PROCESSOR + '/access-request')
      .send(accessRequest);
    await request(app.getHttpServer())
      .post(BASE_PATH_WAGES_PROCESSOR + '/access-request')
      .send(accessRequest)
      .then((result) => {
        expect(result.statusCode).toEqual(201);
        expect(result.body.data.requestedAmount).toEqual(1000);
        expect(
          result.body.data.employeeWageData.totalAvailableForAccessRequest,
        ).toEqual(1170);
      });
  });

  it('Should register a new currency update in the price', async () => {
    const currencyRate = {
      firstConversionTypeSymbol: 'USD',
      secondConversionTypeSymbol: 'ARS',
      exchangeRate: 150,
    };
    await request(app.getHttpServer())
      .post(BASE_PATH_WAGES_PROCESSOR + '/register-currency-rate')
      .send(currencyRate)
      .then((result) => {
        expect(result.statusCode).toEqual(201);
        expect(result.body.data.exchangeRate).toEqual(150);
      });
  });

  it('Should register a new currency update in the price more that one time', async () => {
    await request(app.getHttpServer())
      .post(BASE_PATH_WAGES_PROCESSOR + '/register-currency-rate')
      .send({
        firstConversionTypeSymbol: 'USD',
        secondConversionTypeSymbol: 'ARS',
        exchangeRate: 150,
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201);
        expect(result.body.data.exchangeRate).toEqual(150);
      });
    await request(app.getHttpServer())
      .post(BASE_PATH_WAGES_PROCESSOR + '/register-currency-rate')
      .send({
        firstConversionTypeSymbol: 'USD',
        secondConversionTypeSymbol: 'ARS',
        exchangeRate: 200,
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201);
        expect(result.body.data.exchangeRate).toEqual(200);
      });
    await request(app.getHttpServer())
      .post(BASE_PATH_WAGES_PROCESSOR + '/register-currency-rate')
      .send({
        firstConversionTypeSymbol: 'USD',
        secondConversionTypeSymbol: 'ARS',
        exchangeRate: 300,
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201);
        expect(result.body.data.exchangeRate).toEqual(300);
      });
  });

  it('Should register a new currency rate', async () => {
    const currencyRate = {
      firstConversionTypeSymbol: 'BTC',
      secondConversionTypeSymbol: 'ARS',
      exchangeRate: 60000.36,
    };
    await request(app.getHttpServer())
      .post(BASE_PATH_WAGES_PROCESSOR + '/register-currency-rate')
      .send(currencyRate)
      .then((result) => {
        expect(result.statusCode).toEqual(201);
        expect(result.body.data.exchangeRate).toEqual(60000.36);
      });
  });
});

import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as sampleData from '../../../test/utils/sample_wage_data.json';
import { CurrencyRates } from '../entity/currency-rates.entity';
import { EMPLOYEE_DATA_REPOSITORY } from '../repository/employee-data.repository';
import { CURRENCY_RATES_REPOSITORY } from '../repository/currency-rates.repository';
import { ACCESS_REQUEST_REPOSITORY } from '../repository/access-request.repository';
import { EmployeeData } from '../entity/employee-data.entity';
import { AccessRequest } from '../entity/access-request.entity';
import BigDecimal from 'big.js';
import { AccessRequestDto } from '../dto/access-request.dto';

@Injectable()
export class WagesService {
  constructor(
    @Inject(EMPLOYEE_DATA_REPOSITORY)
    private employeeWageDataRepository: Repository<EmployeeData>,
    @Inject(CURRENCY_RATES_REPOSITORY)
    private currencyRatesRepository: Repository<CurrencyRates>,
    @Inject(ACCESS_REQUEST_REPOSITORY)
    private wageAccessRequestRepository: Repository<AccessRequest>,
  ) {}

  async getBalance(employeeID: string): Promise<number> {
    const employeeWageData: EmployeeData =
      await this.employeeWageDataRepository.findOne({
        where: {
          id: employeeID,
        },
        relations: {
          wageAccessRequest: true,
        },
      });
    const requestedAmount = this.sumRequestedAmounts(
      employeeWageData.wageAccessRequest,
    );
    return employeeWageData.totalEarnedWages - (requestedAmount || 0);
  }

  private sumRequestedAmounts(requests: AccessRequest[]): number {
    const total = requests.reduce(
      (acc, curr) => acc.plus(curr.requestedAmount),
      new BigDecimal(0),
    );
    return parseFloat(total.toFixed(2));
  }

  async loadInitialData(): Promise<void> {
    // Read file json sample_wage_data.json
    const employeeList: EmployeeData[] = sampleData.employeeWageData.map(
      (employeeData) => {
        return {
          id: undefined,
          employeeID: employeeData.employeeID,
          totalEarnedWages: employeeData.totalEarnedWages,
          currency: employeeData.currency,
          wageAccessRequest: [],
        };
      },
    );
    const currencyRates: CurrencyRates[] = Object.keys(
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
      const savedCurrencyRate = await this.currencyRatesRepository.save(
        currencyRate,
      );
      console.log('Saved currency rate:', savedCurrencyRate);
    }
    for (const employee of employeeList) {
      const savedEmployee = await this.employeeWageDataRepository.save(
        employee,
      );
      const accessRequests = accessRequestsList.filter(
        (wageAccessRequest) =>
          wageAccessRequest.employeeID === employee.employeeID,
      );
      for (const accessRequest of accessRequests) {
        accessRequest.employeeWageData = savedEmployee;
        const savedAccessRequest = await this.wageAccessRequestRepository.save(
          accessRequest,
        );
        console.log('Saved wage access request:', savedAccessRequest);
      }
      console.log('Saved employee:', savedEmployee);
    }
  }

  async requestAccess(accessRequest: AccessRequestDto) {
    const employeeWageData: EmployeeData =
      await this.employeeWageDataRepository.findOne({
        where: {
          employeeID: accessRequest.employeeID,
        },
        relations: {
          wageAccessRequest: true,
        },
      });
    const requestedAmount = this.sumRequestedAmounts(
      employeeWageData.wageAccessRequest,
    );
    const balance = BigDecimal(
      employeeWageData.totalEarnedWages - requestedAmount,
    );
    if (balance < accessRequest.requestedAmount) {
      throw new Error('Insufficient balance');
    }
    const newAccessRequest: AccessRequest = {
      id: undefined,
      requestID: accessRequest.requestID,
      employeeID: accessRequest.employeeID,
      requestedAmount: parseFloat(accessRequest.requestedAmount.toFixed(2)),
      requestedCurrency: accessRequest.requestedCurrency,
      employeeWageData: employeeWageData,
    };
    return this.wageAccessRequestRepository.save(newAccessRequest);
  }
}

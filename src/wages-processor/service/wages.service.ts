import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as sampleData from '../../../test/utils/sample_wage_data.json';

import { EMPLOYEE_DATA_REPOSITORY } from '../repository/employee-data.repository';
import { CURRENCY_RATES_REPOSITORY } from '../repository/currency-rates.repository';
import { ACCESS_REQUEST_REPOSITORY } from '../repository/access-request.repository';
import { EmployeeData } from '../entity/employee-data.entity';
import { AccessRequest } from '../entity/access-request.entity';
import BigDecimal from 'big.js';
import { AccessRequestDto } from '../dto/access-request.dto';
import { RegisterCurrencyDto } from '../dto/register-currency.dto';
import { CurrencyRate } from '../entity/currency-rate.entity';

@Injectable()
export class WagesService {
  constructor(
    @Inject(EMPLOYEE_DATA_REPOSITORY)
    private employeeWageDataRepository: Repository<EmployeeData>,
    @Inject(CURRENCY_RATES_REPOSITORY)
    private currencyRatesRepository: Repository<CurrencyRate>,
    @Inject(ACCESS_REQUEST_REPOSITORY)
    private wageAccessRequestRepository: Repository<AccessRequest>,
  ) {}

  async getBalance(employeeID: string): Promise<number> {
    const employeeWageData: EmployeeData =
      await this.employeeWageDataRepository.findOne({
        where: {
          employeeID: employeeID,
        },
        relations: {
          wageAccessRequest: true,
        },
      });
    return employeeWageData.totalAvailableForAccessRequest;
  }

  private getCurrencyNumber(total: BigDecimal) {
    return parseFloat(total.toFixed(2));
  }

  async loadInitialData(): Promise<void> {
    // Clean up database data first. This is for testing purposes only and should not be used in production.
    await this.wageAccessRequestRepository.delete({});
    await this.employeeWageDataRepository.delete({});
    await this.currencyRatesRepository.delete({});
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
    // Find the employee wage data
    const employeeWageData: EmployeeData =
      await this.employeeWageDataRepository.findOne({
        where: {
          employeeID: accessRequest.employeeID,
        },
        relations: {
          wageAccessRequest: true,
        },
      });
    // Process the requested amount in base currency
    const requestedAmountInBaseCurrencyToRegister: BigDecimal =
      await this.processRequestAmountInBaseCurrency(
        accessRequest,
        employeeWageData,
      );
    // Register the requested amount
    const newAccessRequest: AccessRequest = {
      id: undefined,
      requestID: accessRequest.requestID,
      employeeID: accessRequest.employeeID,
      requestedAmount: this.getCurrencyNumber(accessRequest.requestedAmount),
      requestedCurrency: accessRequest.requestedCurrency,
      employeeWageData: employeeWageData,
    };
    const requestRecord = await this.wageAccessRequestRepository.save(
      newAccessRequest,
    );
    // Update the balance for total available for access request
    employeeWageData.totalAvailableForAccessRequest = this.getCurrencyNumber(
      new BigDecimal(
        employeeWageData.totalAvailableForAccessRequest.toString(),
      ).sub(requestedAmountInBaseCurrencyToRegister),
    );
    // Save the updated employee wage data
    await this.employeeWageDataRepository.save(employeeWageData);
    return requestRecord;
  }

  private async processRequestAmountInBaseCurrency(
    accessRequest: AccessRequestDto,
    employeeWageData: EmployeeData,
  ): Promise<BigDecimal> {
    // Get the balance currency type and the requested currency type
    const balanceCurrencyType = employeeWageData.currency;
    const requestedCurrencyType = accessRequest.requestedCurrency;
    // Check if the balance currency type is different from the requested currency type
    if (balanceCurrencyType !== requestedCurrencyType) {
      // Find the requested currency rate
      const requestedCurrencyRate = await this.findCurrencyRate(
        this.getConversionTypeFormat(
          requestedCurrencyType,
          balanceCurrencyType,
        ),
      );
      // Check if the currency rate exists to make possible the conversion
      if (!requestedCurrencyRate) {
        throw new Error(
          'Currency rate not found so conversion is not possible',
        );
      }
      // Convert the requested amount to the balance currency type
      const requestedAmountInBalanceCurrency = new BigDecimal(
        accessRequest.requestedAmount,
      ).mul(requestedCurrencyRate.exchangeRate);
      // Get the balance from employee wage data
      const totalAvailableForAccessRequest = BigDecimal(
        employeeWageData.totalAvailableForAccessRequest.toString(),
      );
      // Check if the balance is less than the requested amount
      if (requestedAmountInBalanceCurrency > totalAvailableForAccessRequest) {
        throw new Error('Insufficient balance when making the conversion');
      }
      // Then return the requested amount in the balance currency type found in the conversion
      return requestedAmountInBalanceCurrency;
    } else {
      // Then return the requested amount in the balance currency type directly from request
      return accessRequest.requestedAmount;
    }
  }

  async registerCurrencyRate(
    registerCurrency: RegisterCurrencyDto,
  ): Promise<CurrencyRate> {
    let currencyToRegister: CurrencyRate;
    // Format the conversion type
    const conversionTypeFormat = this.getConversionTypeFormat(
      registerCurrency.firstConversionTypeSymbol,
      registerCurrency.secondConversionTypeSymbol,
    );
    // Check if the currency rate already exists
    const currencyRateExists = await this.currencyRatesRepository.findOne({
      where: {
        conversionType: conversionTypeFormat,
      },
    });
    if (currencyRateExists) {
      // Update the currency rate
      currencyRateExists.exchangeRate = this.getCurrencyNumber(
        registerCurrency.exchangeRate,
      );
      currencyToRegister = currencyRateExists;
    } else {
      currencyToRegister = {
        id: undefined,
        conversionType: conversionTypeFormat,
        exchangeRate: this.getCurrencyNumber(registerCurrency.exchangeRate),
      };
    }
    // Save or update the currency rate
    return this.currencyRatesRepository.save(currencyToRegister);
  }

  private getConversionTypeFormat(
    firstConversionTypeSymbol: string,
    secondConversionTypeSymbol: string,
  ): string {
    return `${firstConversionTypeSymbol}_${secondConversionTypeSymbol}`;
  }

  async findCurrencyRate(conversionType: string): Promise<CurrencyRate> {
    return this.currencyRatesRepository.findOne({
      where: {
        conversionType,
      },
    });
  }
}

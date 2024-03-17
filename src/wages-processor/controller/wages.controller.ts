import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { WagesService } from '../service/wages.service';
import { AccessRequestDto } from '../dto/access-request.dto';
import { ResponseApiDto } from '../dto/response-api.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterCurrencyDto } from '../dto/register-currency.dto';
import { RegisterEmployeeDataDto } from '../dto/register-employee-data.dto';

export const BASE_PATH_WAGES_PROCESSOR = '/api/v1/wages';

@ApiTags('Wages Processor')
@Controller(BASE_PATH_WAGES_PROCESSOR)
export class WagesController {
  constructor(private readonly appService: WagesService) {}

  @ApiOperation({
    summary:
      "Calculate the real-time balance of an employee's earned wages, accounting for any previous wage access requests.",
  })
  @ApiResponse({
    description:
      'Message response result from API when calculate the real-time balance of an employee.',
    type: ResponseApiDto,
  })
  @Get('/balance/:employeeId')
  async getBalance(
    @Param('employeeId') employeeId: string,
  ): Promise<ResponseApiDto> {
    try {
      return {
        message: 'Balance retrieved successfully',
        data: await this.appService.getBalance(employeeId),
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error retrieving balance',
          data: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({
    summary:
      'Determine if a wage access request can be approved based on the available balance and the requested amount.',
  })
  @ApiResponse({
    description:
      'Message response result from API when creates the wage access request.',
    type: ResponseApiDto,
  })
  @Post('/access-request')
  async requestAccess(
    @Body() accessRequest: AccessRequestDto,
  ): Promise<ResponseApiDto> {
    try {
      return {
        message: 'Access requested successfully',
        data: await this.appService.requestAccess(accessRequest),
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error requesting access',
          data: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({
    summary:
      'Register the currency rate for a specific currency, which will be used to convert the requested amount to the employee’s currency.',
  })
  @ApiResponse({
    description:
      'Message response result from API when register the currency rate.',
    type: ResponseApiDto,
  })
  @Post('/register-currency-rate')
  async registerCurrencyRate(
    @Body() registerCurrency: RegisterCurrencyDto,
  ): Promise<ResponseApiDto> {
    try {
      return {
        message: 'Currency rate registered successfully',
        data: await this.appService.registerCurrencyRate(registerCurrency),
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error registering currency rate',
          data: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({
    summary:
      'Register the employee data, which will be used to calculate the real-time balance and to approve wage access requests.',
  })
  @ApiResponse({
    description:
      'Message response result from API when register the employee data.',
    type: ResponseApiDto,
  })
  @Post('/register-employee-data')
  async registerEmployeeData(
    @Body() registerEmployeeDataDto: RegisterEmployeeDataDto,
  ) {
    try {
      return {
        message: 'Employee data registered successfully',
        data: await this.appService.registerEmployeeData({
          employeeID: registerEmployeeDataDto.employeeID,
          totalEarnedWages: registerEmployeeDataDto.totalEarnedWages,
          currency: registerEmployeeDataDto.currency,
        }),
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error registering employee data',
          data: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

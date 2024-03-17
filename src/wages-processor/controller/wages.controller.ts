import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WagesService } from '../service/wages.service';
import { AccessRequestDto } from '../dto/access-request.dto';
import { ResponseApiDto } from '../dto/response-api.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Wages Processor')
@Controller('/api/v1/wages')
export class WagesController {
  constructor(private readonly appService: WagesService) {}

  @ApiOperation({
    summary:
      'Load initial data for testing purposes, also will clean up the database data so take care when using it and should not be used in production.',
  })
  @Get('/load-initial-data')
  async loadInitialData(): Promise<ResponseApiDto> {
    try {
      return {
        message: 'Initial data loaded successfully for testing purposes',
        data: await this.appService.loadInitialData(),
      };
    } catch (error) {
      return {
        message: 'Error loading initial data',
        data: error.message,
      };
    }
  }

  @ApiOperation({
    summary:
      "Calculate the real-time balance of an employee's earned wages, accounting for any previous wage access requests.",
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
      return {
        message: 'Error retrieving balance',
        data: error.message,
      };
    }
  }

  @ApiOperation({
    summary:
      'Determine if a wage access request can be approved based on the available balance and the requested amount.',
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
      return {
        message: 'Error requesting access',
        data: error.message,
      };
    }
  }
}

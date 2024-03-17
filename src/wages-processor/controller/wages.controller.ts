import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WagesService } from '../service/wages.service';
import { AccessRequestDto } from '../dto/access-request.dto';
import { ResponseApiDto } from '../dto/response-api.dto';

@Controller('/api/v1/wages')
export class WagesController {
  constructor(private readonly appService: WagesService) {}

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

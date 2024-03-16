import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WagesService } from '../service/wages.service';
import { AccessRequestDto } from '../dto/access-request.dto';
import { ResponseApiDto } from '../dto/response-api.dto';

@Controller('/api/v1/wages')
export class WagesController {
  constructor(private readonly appService: WagesService) {}

  @Get('/load-initial-data')
  async loadInitialData(): Promise<void> {
    return await this.appService.loadInitialData();
  }

  @Get('/balance/:employeeId')
  async getBalance(
    @Param('employeeId') employeeId: string,
  ): Promise<ResponseApiDto> {
    try {
      const balance = await this.appService.getBalance(employeeId);
      return {
        message: 'Balance retrieved successfully',
        data: balance,
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
      const savedRequest = await this.appService.requestAccess(accessRequest);
      return {
        message: 'Access requested successfully',
        data: savedRequest,
      };
    } catch (error) {
      return {
        message: 'Error requesting access',
        data: error.message,
      };
    }
  }
}
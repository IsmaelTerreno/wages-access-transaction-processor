import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WagesService } from './wages.service';
import { AccessRequestDto } from './access-request.dto';
import { AccessRequest } from './access-request.entity';

@Controller('/api/v1/wages')
export class WagesController {
  constructor(private readonly appService: WagesService) {}

  @Get('/load-initial-data')
  async loadInitialData(): Promise<void> {
    return await this.appService.loadInitialData();
  }

  @Get('/balance/:employeeId')
  async getBalance(@Param('employeeId') employeeId: string): Promise<number> {
    return await this.appService.getBalance(employeeId);
  }

  @Post('/access-request')
  async requestAccess(
    @Body() accessRequest: AccessRequestDto,
  ): Promise<AccessRequest> {
    return await this.appService.requestAccess(accessRequest);
  }
}

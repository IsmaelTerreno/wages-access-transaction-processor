import { Controller, Get, Param } from '@nestjs/common';
import { WagesService } from './wages.service';

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
}

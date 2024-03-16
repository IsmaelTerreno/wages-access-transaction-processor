import { Controller, Get } from '@nestjs/common';
import { WagesService } from './wages.service';

@Controller()
export class WagesController {
  constructor(private readonly appService: WagesService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

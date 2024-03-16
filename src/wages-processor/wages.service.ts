import { Injectable } from '@nestjs/common';

@Injectable()
export class WagesService {
  getHello(): string {
    return 'Hello World!';
  }
}

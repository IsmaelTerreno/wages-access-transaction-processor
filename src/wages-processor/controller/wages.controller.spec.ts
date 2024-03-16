import { Test, TestingModule } from '@nestjs/testing';
import { WagesController } from './wages.controller';
import { WagesService } from '../service/wages.service';

describe('AppController', () => {
  let appController: WagesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WagesController],
      providers: [WagesService],
    }).compile();

    appController = app.get<WagesController>(WagesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.loadInitialData()).toBe(200);
    });
  });
});
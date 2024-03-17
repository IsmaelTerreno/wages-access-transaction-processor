import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { WagesModule } from '../src/wages-processor/wages.module';
import { WagesService } from '../src/wages-processor/service/wages.service';

describe('Wages API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WagesModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const wagesService = moduleFixture.get<WagesService>(WagesService);
    await wagesService.loadInitialData();
    await app.init();
  });

  it('/ (GET)', () => {
    //
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

import { DataSource } from 'typeorm';

import { DATA_SOURCE } from '../database/database.providers';
import { AccessRequest } from './access-request.entity';

export const ACCESS_REQUEST_REPOSITORY = 'ACCESS_REQUEST_REPOSITORY';
export const AccessRequestRepository = {
  provide: ACCESS_REQUEST_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(AccessRequest),
  inject: [DATA_SOURCE],
};

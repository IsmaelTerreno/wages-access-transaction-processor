import { DataSource } from 'typeorm';

import { DATA_SOURCE } from '../../database/database.providers';
import { EmployeeData } from '../entity/employee-data.entity';

export const EMPLOYEE_DATA_REPOSITORY = 'EMPLOYEE_DATA_REPOSITORY';
export const EmployeeDataRepository = {
  provide: EMPLOYEE_DATA_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(EmployeeData),
  inject: [DATA_SOURCE],
};

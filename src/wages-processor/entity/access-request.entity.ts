import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmployeeData } from './employee-data.entity';

@Entity()
export class AccessRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  requestID: string;

  @Column({ nullable: false })
  employeeID: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  requestedAmount: number;

  @Column({ nullable: false })
  requestedCurrency: string;

  @ManyToOne(() => EmployeeData, (employee) => employee.wageAccessRequest)
  employeeWageData: EmployeeData;
}

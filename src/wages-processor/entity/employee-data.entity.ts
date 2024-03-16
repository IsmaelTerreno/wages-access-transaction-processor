import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AccessRequest } from './access-request.entity';

@Entity()
export class EmployeeData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  employeeID: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalEarnedWages: number;

  @Column({ nullable: false })
  currency: string;

  @OneToMany(() => AccessRequest, (request) => request.employeeWageData)
  wageAccessRequest: AccessRequest[];
}

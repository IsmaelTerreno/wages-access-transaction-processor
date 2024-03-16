import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EmployeeWageData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  employeeID: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalEarnedWages: number;

  @Column({ nullable: false })
  currency: string;
}

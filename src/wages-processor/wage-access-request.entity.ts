import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WageAccessRequest {
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
}

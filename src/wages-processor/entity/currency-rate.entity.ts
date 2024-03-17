import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CurrencyRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  conversionType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  exchangeRate: number;
}

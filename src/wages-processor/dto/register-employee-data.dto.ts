import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class RegisterEmployeeDataDto {
  @ApiProperty({ description: 'Custom employee ID' })
  @IsString()
  employeeID: string;

  @ApiProperty({ description: 'Total earned wages.' })
  @IsNumber()
  totalEarnedWages: number;

  @ApiProperty({ description: 'Currency type for the employee balance' })
  @IsString()
  currency: string;
}

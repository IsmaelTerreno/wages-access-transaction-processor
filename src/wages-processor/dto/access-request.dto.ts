import { ApiProperty } from '@nestjs/swagger';
import { IsCurrency, IsNumber, IsString } from 'class-validator';
import BigDecimal from 'big.js';

export class AccessRequestDto {
  @ApiProperty({ description: 'Request ID related to one wage employee data.' })
  @IsString()
  requestID: string;

  @ApiProperty({
    description: 'Wage employee data ID for this access request.',
  })
  @IsString()
  employeeID: string;

  @ApiProperty({
    description:
      "The amount requested for this access request that would be deducted from the employee's balance.",
  })
  @IsNumber()
  @IsCurrency()
  requestedAmount: BigDecimal;

  @ApiProperty({
    description: 'The available currency for this access request.',
  })
  @IsString()
  requestedCurrency: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import BigDecimal from 'big.js';

export class RegisterCurrencyDto {
  @ApiProperty({ description: 'First conversion type symbol to register.' })
  @IsString()
  firstConversionTypeSymbol: string;

  @ApiProperty({ description: 'Second conversion type symbol to register.' })
  @IsString()
  secondConversionTypeSymbol: string;

  @ApiProperty({
    description:
      'The exchange rate between the first and second conversion type symbols.',
  })
  @IsNumber()
  exchangeRate: BigDecimal;
}

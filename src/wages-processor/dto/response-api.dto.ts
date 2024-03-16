import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResponseApiDto {
  @ApiProperty({ description: 'Message response result from API.' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Result data.' })
  @IsString()
  data: any;
}

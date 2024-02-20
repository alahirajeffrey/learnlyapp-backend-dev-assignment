import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @ApiProperty({ default: 0 })
  skip: number;

  @IsOptional()
  @ApiProperty({ default: 10 })
  limit: number;
}

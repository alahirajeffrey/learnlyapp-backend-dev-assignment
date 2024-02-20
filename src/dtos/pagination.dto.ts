import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @ApiProperty({ default: 1 })
  page: number;

  @IsOptional()
  @ApiProperty({ default: 10 })
  pageSize: number;
}

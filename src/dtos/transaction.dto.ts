import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DepositAndWithdrawalDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  amount: number;
}

export class TransferDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  accountNumber: string;
}

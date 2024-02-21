import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { DepositAndWithdrawalDto, TransferDto } from 'src/dtos/transaction.dto';
import { AuthGaurd } from 'src/auth/guards/authentication.guard';

@UseGuards(AuthGaurd)
@ApiSecurity('JWT-auth')
@ApiTags('transaction-endpoints')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Patch('deposit')
  @ApiOperation({ summary: 'Fund account' })
  depositFunds(@Req() req, @Body() dto: DepositAndWithdrawalDto) {
    return this.transactionService.depositFunds(req.user.email, dto);
  }

  @Patch('transfer')
  @ApiOperation({ summary: 'Transfer funds' })
  transferFunds(@Req() req, @Body() dto: TransferDto) {
    return this.transactionService.transferFunds(req.user.email, dto);
  }

  @Patch('withdrawal')
  @ApiOperation({ summary: 'Withdraw funds' })
  withdrawFunds(@Req() req, @Body() dto: DepositAndWithdrawalDto) {
    return this.transactionService.withdrawFunds(req.user.email, dto);
  }
}

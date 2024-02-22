import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../dtos/pagination.dto';
import { AuthGaurd } from '../auth/guards/authentication.guard';

@UseGuards(AuthGaurd)
@ApiSecurity('JWT-auth')
@ApiTags('account-endpoints')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create an account for a user' })
  createAccount(@Req() req) {
    return this.accountService.createAccount(req.user.email);
  }

  @Get('own')
  @ApiOperation({ summary: 'Get own account details' })
  getOwnAccountDetails(@Req() req) {
    return this.accountService.getOwnAccountDetails(req.user.email);
  }

  @Get('deposits')
  @ApiOperation({ summary: 'Get account deposits ' })
  getAccountDeposits(@Req() req, @Query() dto: PaginationDto) {
    return this.accountService.getAccountDeposits(req.user.email, dto);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'Get account withdrawals ' })
  getAccountWithdrawals(@Req() req, @Query() dto: PaginationDto) {
    return this.accountService.getAccountWithdrawals(req.user.email, dto);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get account transfers ' })
  getAccountTransfers(@Req() req, @Query() dto: PaginationDto) {
    return this.accountService.getAccountTransfers(req.user.email, dto);
  }
}

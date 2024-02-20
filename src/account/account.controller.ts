import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { AccountService } from './account.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

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

  // protect with roles guard
  @Get('transactions/other/:accountNumber')
  @ApiOperation({ summary: 'Get other`s account transactions' })
  getOtherAccountTransactions(@Param('accountNumber') accountNumber: string) {
    return this.accountService.getOtherAccountTransactions(accountNumber);
  }

  @Get('transactions/own')
  @ApiOperation({ summary: 'Get own account transactions' })
  getOwnAccountTransactions(@Req() req) {
    return this.accountService.getOwnAccountTransactions(req.user.email);
  }
}

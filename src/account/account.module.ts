import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/schemas/account.schema';
import { UtilService } from 'src/common/utils/utils.utils';
import { Deposit, DepositSchema } from 'src/schemas/deposit.schema';
import { Withdrawal, WithdrawalSchema } from 'src/schemas/withdrawal.schema';
import { Transfer, TransferSchema } from 'src/schemas/transfer.schema';

@Module({
  providers: [AccountService, UtilService],
  controllers: [AccountController],
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Deposit.name, schema: DepositSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Transfer.name, schema: TransferSchema },
    ]),
  ],
})
export class AccountModule {}

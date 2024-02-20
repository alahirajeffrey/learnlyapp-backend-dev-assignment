import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/schemas/account.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';
import { UtilService } from 'src/common/utils/utils.utils';

@Module({
  providers: [AccountService, UtilService],
  controllers: [AccountController],
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
})
export class AccountModule {}

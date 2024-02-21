import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/schemas/account.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService],
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      // { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
})
export class TransactionModule {}

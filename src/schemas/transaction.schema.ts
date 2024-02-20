import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Account } from './account.schema';
import { TransactionType } from 'src/common/enums/transaction.enum';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop()
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  account: Account;

  @Prop({ enum: TransactionType, default: TransactionType.Deposit })
  transactionType: TransactionType;

  @Prop({})
  amount: number;

  @Prop({})
  primaryAccountNumber: string;

  @Prop({})
  SecondaryAccountNumber: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

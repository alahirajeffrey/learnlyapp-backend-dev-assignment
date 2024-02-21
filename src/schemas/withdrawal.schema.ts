import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Account } from './account.schema';

export type WithdrawalDocument = HydratedDocument<Withdrawal>;

@Schema({ timestamps: true })
export class Withdrawal {
  @Prop()
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  account: Account;

  @Prop({})
  amount: number;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);

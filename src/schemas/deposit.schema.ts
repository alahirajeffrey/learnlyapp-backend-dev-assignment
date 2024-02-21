import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Account } from './account.schema';

export type DepositDocument = HydratedDocument<Deposit>;

@Schema({ timestamps: true })
export class Deposit {
  @Prop()
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  account: Account;

  @Prop({})
  amount: number;
}

export const DepositSchema = SchemaFactory.createForClass(Deposit);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Account } from './account.schema';

export type TransferDocument = HydratedDocument<Transfer>;

@Schema({ timestamps: true })
export class Transfer {
  @Prop()
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  senderAccount: Account;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  recieverAccount: Account;

  @Prop({})
  amount: number;
}

export const TransferSchema = SchemaFactory.createForClass(Transfer);

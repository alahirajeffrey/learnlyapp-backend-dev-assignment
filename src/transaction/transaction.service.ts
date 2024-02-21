import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DepositAndWithdrawalDto, TransferDto } from 'src/dtos/transaction.dto';
import { Account } from 'src/schemas/account.schema';
import { Transaction } from 'src/schemas/transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  /**
   * deposit funds to own account
   * @param email : user email
   * @param dto : amount to be deposited
   * @returns : account details
   */
  async depositFunds(email: string, dto: DepositAndWithdrawalDto) {
    const session = await this.connection.startSession();
    try {
      // get account details
      const accountDetails = await this.accountModel.findOne({ email });
      if (!accountDetails) {
        throw new NotFoundException();
      }

      // update account balance
      await this.accountModel
        .findByIdAndUpdate(accountDetails._id, {
          $inc: { balance: +dto.amount },
        })
        .session(session);

      // commit transaction if successful
      await session.commitTransaction();

      return {
        message: `${dto.amount} deposited successfully. New balance is ${accountDetails.balance + dto.amount}`,
      };
    } catch (error) {
      // abort transaction and rollback changes if error occurs
      await session.abortTransaction();
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      // end transacation session
      session.endSession();
    }
  }

  /**
   * transfer funds to another account
   * @param email : sender's email
   * @param dto : amount and reciever's account number
   * @returns : message
   */
  async transferFunds(email: string, dto: TransferDto) {
    const session = await this.connection.startSession();
    try {
      // get sender account details
      const senderAccountDetails = await this.accountModel.findOne({ email });
      if (!senderAccountDetails) {
        throw new NotFoundException();
      }

      // get reciever account details
      const recieverAccountDetails = await this.accountModel.findOne({
        accountNumber: dto.accountNumber,
      });
      if (!recieverAccountDetails) {
        throw new NotFoundException("Reciever's account does not exist ");
      }

      // check if sender has sufficient balance
      if (senderAccountDetails.balance < dto.amount) {
        if (!recieverAccountDetails) {
          throw new BadRequestException('Insufficient balance');
        }
      }

      //deduct amount from sender
      await this.accountModel
        .findByIdAndUpdate(senderAccountDetails._id, {
          balance: -dto.amount,
        })
        .session(session);

      // increase reciever balance
      await this.accountModel
        .findByIdAndUpdate(recieverAccountDetails._id, {
          $inc: { balance: +dto.amount },
        })
        .session(session);

      // commit transaction if successful
      await session.commitTransaction();

      return {
        message: `Transfer successful. Current balance is ${senderAccountDetails.balance - dto.amount}`,
      };
    } catch (error) {
      // abort transaction and rollback changes if error occurs
      await session.abortTransaction();
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      // end transacation session
      session.endSession();
    }
  }

  async withdrawFunds(email: string, dto: DepositAndWithdrawalDto) {
    const session = await this.connection.startSession();
    try {
      // get account details
      const accountDetails = await this.accountModel.findOne({ email });
      if (!accountDetails) {
        throw new NotFoundException();
      }

      // check if balance is sufficient
      if (accountDetails.balance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // update account balance
      await this.accountModel
        .findByIdAndUpdate(accountDetails._id, { balance: -dto.amount })
        .session(session);

      // commit transaction if successful
      await session.commitTransaction();

      return {
        message: `${dto.amount} withdrawn. Balance is ${accountDetails.balance - dto.amount}`,
      };
    } catch (error) {
      // abort transaction and rollback changes if error occurs
      await session.abortTransaction();
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      // end transacation session
      session.endSession();
    }
  }
}

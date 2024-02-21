import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DepositAndWithdrawalDto, TransferDto } from 'src/dtos/transaction.dto';
import { Account } from 'src/schemas/account.schema';
import { Deposit } from 'src/schemas/deposit.schema';
import { Transfer } from 'src/schemas/transfer.schema';
import { Withdrawal } from 'src/schemas/withdrawal.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Deposit.name) private depositModel: Model<Deposit>,
    @InjectModel(Transfer.name) private transferModel: Model<Transfer>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<Withdrawal>,
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
    session.startTransaction();
    try {
      // get account details
      const accountDetails = await this.accountModel.findOne({ email });
      if (!accountDetails) {
        throw new HttpException('Account does not exist', HttpStatus.NOT_FOUND);
      }

      // update account balance
      await this.accountModel
        .findByIdAndUpdate(accountDetails._id, {
          $inc: { balance: +dto.amount },
        })
        .session(session);

      // save deposit details
      await this.depositModel.create({
        amount: dto.amount,
        account: accountDetails._id,
      });

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
    session.startTransaction();
    try {
      // get sender account details
      const senderAccountDetails = await this.accountModel.findOne({ email });
      if (!senderAccountDetails) {
        throw new HttpException('Account does not exist', HttpStatus.NOT_FOUND);
      }

      // get reciever account details
      const recieverAccountDetails = await this.accountModel.findOne({
        accountNumber: dto.accountNumber,
      });
      if (!recieverAccountDetails) {
        throw new HttpException(
          'Reciever does not exist',
          HttpStatus.NOT_FOUND,
        );
      }

      // check if sender has sufficient balance
      if (senderAccountDetails.balance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
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

      // save transfer details
      await this.transferModel.create({
        senderAccount: senderAccountDetails._id,
        recieverAccount: recieverAccountDetails._id,
        amount: dto.amount,
      });

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

  /**
   * withdraw funds
   * @param email : user's email
   * @param dto : amount to withdraw
   * @returns : message
   */
  async withdrawFunds(email: string, dto: DepositAndWithdrawalDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // get account details
      const accountDetails = await this.accountModel.findOne({ email });
      if (!accountDetails) {
        throw new HttpException('Account does not exist', HttpStatus.NOT_FOUND);
      }

      // check if balance is sufficient
      if (accountDetails.balance < dto.amount) {
        throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
      }

      // update account balance
      await this.accountModel
        .findByIdAndUpdate(accountDetails._id, { balance: -dto.amount })
        .session(session);

      // save withdrawal details
      await this.withdrawalModel.create({
        account: accountDetails._id,
        amount: dto.amount,
      });

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

import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DepositAndWithdrawalDto, TransferDto } from '../dtos/transaction.dto';
import { Account } from '../schemas/account.schema';
import { Deposit } from '../schemas/deposit.schema';
import { Transfer } from '../schemas/transfer.schema';
import { Withdrawal } from '../schemas/withdrawal.schema';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Deposit.name) private depositModel: Model<Deposit>,
    @InjectModel(Transfer.name) private transferModel: Model<Transfer>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<Withdrawal>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
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
      this.logger.error(error);
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
        throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
      }

      //deduct amount from sender
      await this.accountModel
        .findByIdAndUpdate(senderAccountDetails._id, {
          balance: senderAccountDetails.balance - dto.amount,
        })
        .session(session);

      // increase reciever balance
      await this.accountModel
        .findByIdAndUpdate(recieverAccountDetails._id, {
          balance: recieverAccountDetails.balance + dto.amount,
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
      this.logger.error(error);
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
        .findByIdAndUpdate(accountDetails._id, {
          balance: accountDetails.balance - dto.amount,
        })
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
      this.logger.error(error);
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

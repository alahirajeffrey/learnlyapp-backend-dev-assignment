import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/common/types/response.type';
import { UtilService } from 'src/common/utils/utils.utils';
import { Account } from 'src/schemas/account.schema';
import { Transaction } from 'src/schemas/transaction.schema';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private readonly utilService: UtilService,
  ) {}

  /**
   *
   * @param email
   * @returns
   */
  async createAccount(email: string): Promise<ApiResponse> {
    try {
      // generate account number
      const accountNumber = this.utilService.generateAccountNumber();

      // create account
      const newAccount = await this.accountModel.create({
        email: email,
        accountNumber: accountNumber,
      });

      return { statusCode: HttpStatus.CREATED, data: newAccount };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOwnAccountDetails(email: string): Promise<ApiResponse> {
    try {
      const account = await this.accountModel.findOne({ email });

      return { statusCode: HttpStatus.OK, data: account };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOwnAccountTransactions(email: string): Promise<ApiResponse> {
    try {
      // todo: paginate result
      // get account details via email
      const account = await this.accountModel.findOne({ email });
      if (!account) {
        throw new HttpException(
          'User is yet to create an account',
          HttpStatus.NOT_FOUND,
        );
      }

      // search for transactions via account number
      const transactions = await this.transactionModel.find({
        primaryAccountNumber: account.accountNumber,
      });

      return { statusCode: HttpStatus.OK, data: transactions };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOtherAccountTransactions(
    accountNumber: string,
  ): Promise<ApiResponse> {
    try {
      // todo: paginate result
      // search for transactions via account number
      const transactions = await this.transactionModel.find({
        primaryAccountNumber: accountNumber,
      });

      return { statusCode: HttpStatus.OK, data: transactions };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

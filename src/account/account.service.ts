import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UtilService } from 'src/common/utils/utils.utils';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { Account } from 'src/schemas/account.schema';
import { Deposit } from 'src/schemas/deposit.schema';
import { Transfer } from 'src/schemas/transfer.schema';
import { Withdrawal } from 'src/schemas/withdrawal.schema';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Deposit.name) private depositModel: Model<Deposit>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<Withdrawal>,
    @InjectModel(Transfer.name) private transferModel: Model<Transfer>,
    private readonly utilService: UtilService,
  ) {}

  /**
   *
   * @param email
   * @returns
   */
  async createAccount(email: string) {
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

  /**
   * get own acount detials
   * @param email : user's email
   * @returns : account details
   */
  async getOwnAccountDetails(email: string) {
    try {
      const account = await this.accountModel.findOne({ email });

      return account;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * get own account deposits
   * @param email : user's email
   * @param dto : pagination dto (skip and limit)
   * @returns : list of deposits and page total
   */
  async getAccountDeposits(email: string, dto: PaginationDto) {
    try {
      // get account details via email
      const account = await this.accountModel.findOne({ email });
      if (!account) {
        throw new HttpException(
          'User is yet to create an account',
          HttpStatus.NOT_FOUND,
        );
      }

      // paginate result
      const count = await this.depositModel
        .countDocuments({ account: account._id })
        .exec();
      const pageTotal = Math.floor((count - 1) / dto.limit) + 1;

      // search for transactions via account number
      const deposits = await this.depositModel
        .find({
          account: account._id,
        })
        .limit(dto.limit)
        .skip(dto.skip);

      return {
        deposits,
        pageTotal: pageTotal,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * get own account withdrawals
   * @param email : user's email
   * @param dto : pagination dto (skip and limit)
   * @returns : list of deposits and page total
   */
  async getAccountWithdrawals(email: string, dto: PaginationDto) {
    try {
      // get account details via email
      const account = await this.accountModel.findOne({ email });
      if (!account) {
        throw new HttpException(
          'User is yet to create an account',
          HttpStatus.NOT_FOUND,
        );
      }

      // paginate result
      const count = await this.withdrawalModel
        .countDocuments({ account: account._id })
        .exec();
      const pageTotal = Math.floor((count - 1) / dto.limit) + 1;

      // search for transactions via account number
      const withdrawals = await this.withdrawalModel
        .find({
          account: account._id,
        })
        .limit(dto.limit)
        .skip(dto.skip);

      return {
        withdrawals,
        pageTotal: pageTotal,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAccountTransfers(email: string, dto: PaginationDto) {
    try {
      // get account details via email
      const account = await this.accountModel.findOne({ email });
      if (!account) {
        throw new NotFoundException('User is yet to create an account');
      }

      // paginate result
      const count = await this.transferModel
        .countDocuments({
          $or: [
            { senderAccount: account._id },
            { receiverAccount: account._id },
          ],
        })
        .exec();
      const pageTotal = Math.floor((count - 1) / dto.limit) + 1;

      // search for transactions via account number
      const transfers = await this.transferModel
        .find({
          $or: [
            { senderAccount: account._id },
            { receiverAccount: account._id },
          ],
        })
        .limit(dto.limit)
        .skip(dto.skip);

      return { transfers, pageTotal: pageTotal };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

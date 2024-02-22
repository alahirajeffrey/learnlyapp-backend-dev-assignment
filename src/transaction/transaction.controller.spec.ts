import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { AuthGaurd } from '../auth/guards/authentication.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: AuthGaurd,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        JwtService,
        ConfigService,
        {
          provide: TransactionService,
          useValue: {
            depositFunds: jest.fn(),
            transferFunds: jest.fn(),
            withdrawFunds: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    controller = module.get<TransactionController>(TransactionController);
  });

  describe('transactions controller', () => {
    const req = { user: { email: 'test@example.com' } };

    const fundOrWithdrawalDto = { amount: 500 };

    const transferDto = { amount: 500, accountNumber: '1234567890' };

    it('should be call the fund account service', () => {
      controller.depositFunds(req, fundOrWithdrawalDto);
      expect(service.depositFunds).toHaveBeenCalledWith(
        req.user.email,
        fundOrWithdrawalDto,
      );
    });

    it('should be call the transfer fund service', () => {
      controller.transferFunds(req, transferDto);
      expect(service.transferFunds).toHaveBeenCalledWith(
        req.user.email,
        transferDto,
      );
    });

    it('should be call the withdraw fund service', () => {
      controller.withdrawFunds(req, fundOrWithdrawalDto);
      expect(service.withdrawFunds).toHaveBeenCalledWith(
        req.user.email,
        fundOrWithdrawalDto,
      );
    });
  });
});

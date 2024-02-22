import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AuthGaurd } from '../auth/guards/authentication.guard';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('AccountController', () => {
  let controller: AccountController;
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AuthGaurd,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        JwtService,
        ConfigService,
        {
          provide: AccountService,
          useValue: {
            createAccount: jest.fn(),
            getOwnAccountDetails: jest.fn(),
            getAccountDeposits: jest.fn(),
            getAccountWithdrawals: jest.fn(),
            getAccountTransfers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    controller = module.get<AccountController>(AccountController);
  });

  describe('account controller', () => {
    const req = { user: { email: 'test@example.com' } };

    const dto = { skip: 0, limit: 10 };

    it('should call create account service', () => {
      controller.createAccount(req);
      expect(service.createAccount).toHaveBeenCalled();
      expect(service.createAccount).toHaveBeenCalledWith(req.user.email);
    });

    it('should call the get account details service', () => {
      controller.getOwnAccountDetails(req);
      // expect(service.getOwnAccountDetails).toHaveBeenCalled();
      expect(service.getOwnAccountDetails).toHaveBeenCalledWith(req.user.email);
    });

    it('should call the get account deposits service', () => {
      controller.getAccountDeposits(req, dto);
      // expect(service.getAccountDeposits).toHaveBeenCalled();
      expect(service.getAccountDeposits).toHaveBeenCalledWith(
        req.user.email,
        dto,
      );
    });

    it('should call the get account transfers service', () => {
      controller.getAccountWithdrawals(req, dto);
      // expect(service.getAccountWithdrawals).toHaveBeenCalled();
      expect(service.getAccountWithdrawals).toHaveBeenCalledWith(
        req.user.email,
        dto,
      );
    });

    it('should call the get account withdrawals service', () => {
      controller.getAccountTransfers(req, dto);
      // expect(service.getAccountTransfers).toHaveBeenCalled();
      expect(service.getAccountTransfers).toHaveBeenCalledWith(
        req.user.email,
        dto,
      );
    });
  });
});

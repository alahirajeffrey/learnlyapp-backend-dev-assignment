import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { firstUserStub } from './__stubs__/users.stub';
import { AuthGaurd } from './guards/authentication.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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
          provide: AuthService,
          useValue: {
            registerUser: jest.fn(),
            loginUser: jest.fn(),
            changePassword: jest.fn(),
            updateUser: jest.fn(),
            updateUserToAdmin: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    controller = module.get<AuthController>(AuthController);
  });

  describe('auth controller', () => {
    const createUserDto = {
      email: firstUserStub().email,
      lastName: firstUserStub().lastName,
      firstName: firstUserStub().firstName,
      password: firstUserStub().password,
      mobileNumber: firstUserStub().mobileNumber,
    };

    const loginDto = {
      email: firstUserStub().email,
      password: firstUserStub().password,
    };

    const changePasswordDto = {
      oldPassword: firstUserStub().password,
      newPassword: firstUserStub().password,
    };

    const updateUserDto = {
      lastName: firstUserStub().lastName,
      firstName: firstUserStub().firstName,
      mobileNumber: firstUserStub().mobileNumber,
    };

    // const user = { email: 'test@example.com' };
    const req = { user: { email: createUserDto.email } };

    it('should call register user service', () => {
      controller.registerUser(createUserDto);
      // expect(service.registerUser).toHaveBeenCalled();
      expect(service.registerUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should call login user service', () => {
      controller.loginUser(loginDto);
      // expect(service.loginUser).toHaveBeenCalled();
      expect(service.loginUser).toHaveBeenCalledWith(loginDto);
    });

    it('should call change password service', () => {
      controller.changePassword(req, changePasswordDto);
      // expect(service.changePassword).toHaveBeenCalled();
      expect(service.changePassword).toHaveBeenCalledWith(
        req.user.email,
        changePasswordDto,
      );
    });

    it('should call update user service', () => {
      controller.updateUser(req, updateUserDto);
      // expect(service.updateUser).toHaveBeenCalled();
      expect(service.updateUser).toHaveBeenCalledWith(
        req.user.email,
        updateUserDto,
      );
    });
  });
});

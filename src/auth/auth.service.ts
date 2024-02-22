import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChangePasswordDto,
  LoginUserDto,
  RegisterUserDto,
  UpdateUserDto,
  UpgradeUserRoleDto,
} from 'src/dtos/auth.dto';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/roles.enum';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private jwtService: JwtService,
  ) {}

  /**
   * register a new user
   * @param dto : lastName, firstName, email, password
   * @returns : status code and user object
   */
  async registerUser(dto: RegisterUserDto) {
    try {
      // check if user already exists
      const userExists = await this.userModel.findOne({ email: dto.email });
      if (userExists) {
        throw new HttpException(
          'User with email already exists',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const hashedPassword = await bcrypt.hash(dto.password, 12);

      // create user
      const newUser = await this.userModel.create({
        ...dto,
        password: hashedPassword,
      });

      return newUser;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * login a user
   * @param dto : email and password
   * @returns : status code and access token
   */
  async loginUser(dto: LoginUserDto) {
    try {
      // check if user already exists
      const userExists = await this.userModel.findOne({ email: dto.email });
      if (!userExists) {
        throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      }

      // compare passwords
      const isPasswordCorrect = await bcrypt.compare(
        dto.password,
        userExists.password,
      );
      if (!isPasswordCorrect) {
        throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
      }

      // create payload
      const payload = {
        id: userExists._id,
        email: userExists.email,
        role: userExists.role,
      };

      // sign access token
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        statusCode: HttpStatus.OK,
        data: { accessToken: accessToken },
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * change user password
   * @param email : user email
   * @param dto : cold password, new password
   * @returns : status code and message
   */
  async changePassword(email: string, dto: ChangePasswordDto) {
    try {
      // get user details
      const user = await this.userModel.findOne({ email: email });

      // check if old password is correct
      const isPasswordCorrect = await bcrypt.compare(
        dto.oldPassword,
        user.password,
      );

      if (!isPasswordCorrect) {
        throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
      }

      // update password
      await this.userModel.findByIdAndUpdate(user._id, {
        password: await bcrypt.hash(dto.newPassword, 10),
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Password successfully changed',
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * update a user's details
   * @param email : user email
   * @param dto : firstName, lastName, mobileNumber
   * @returns : status code and message
   */
  async updateUser(email: string, dto: UpdateUserDto) {
    try {
      // get user details
      const user = await this.userModel.findOne({ email: email });

      // updatte user
      await this.userModel.findByIdAndUpdate(user._id, {
        ...dto,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * upgrade a user to admin
   * @param email : admin's email
   * @param dto : email of user
   * @returns : status code and message
   */
  async upgradeUserToAdmin(email: string, dto: UpgradeUserRoleDto) {
    try {
      // get user details
      const user = await this.userModel.findOne({ email: email });

      // check if user is an admin
      if (user.role !== Role.Admin) {
        throw new HttpException(
          'Only admins can upgrade users',
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.userModel.findOneAndUpdate(
        { email: dto.email },
        { role: Role.Admin },
      );

      return { statusCode: HttpStatus.OK, message: 'User upgraded to admin' };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

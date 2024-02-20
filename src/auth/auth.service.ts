import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/common/types/response.type';
import {
  ChangePasswordDto,
  LoginUserDto,
  RegisterUserDto,
  UpdateUserDto,
} from 'src/dtos/auth.dto';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * register a new user
   * @param dto : lastName, firstName, email, password
   * @returns : status code and user object
   */
  async registerUser(dto: RegisterUserDto): Promise<ApiResponse> {
    try {
      // check if user already exists
      const userExists = await this.userModel.findOne({ email: dto.email });
      if (userExists) {
        throw new HttpException(
          'User with email already exists',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // create user
      const newUser = await this.userModel.create({
        password: await bcrypt.hash(dto.password, 10),
        ...dto,
      });

      return { statusCode: HttpStatus.CREATED, data: newUser };
    } catch (error) {
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
  async loginUser(dto: LoginUserDto): Promise<ApiResponse> {
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
  async changePassword(
    email: string,
    dto: ChangePasswordDto,
  ): Promise<ApiResponse> {
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
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(email: string, dto: UpdateUserDto): Promise<ApiResponse> {
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
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async upgradeUserToAdmin(): Promise<ApiResponse> {}
}

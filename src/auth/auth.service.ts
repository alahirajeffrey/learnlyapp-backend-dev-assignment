import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from 'src/common/types/response.type';
import { RegisterUserDto } from 'src/dtos/auth.dto';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDto): ApiResponse {
    try {
      // check if user already exists
      const userExists = await this.userModel.find({ email: dto.email });
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

  async loginUser(): ApiResponse {}

  async changePassword(): ApiResponse {}

  async upgradeUserToAdmin(): ApiResponse {}

  async updateUser(): ApiResponse {}
}

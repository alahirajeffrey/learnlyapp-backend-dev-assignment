import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @MinLength(8, {
    message:
      'Password is too short. Minimal length is $constraint1 characters, but actual is $value',
  })
  @MaxLength(20, {
    message:
      'password is too long. Maximal length is $constraint1 characters, but actual is $value',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,20}$/, {
    message:
      'password must contain the following: a capital letter, a small letter, and a number',
  })
  password: string;
}

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  newPassword: string;
}

export class UpgradeUserRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}

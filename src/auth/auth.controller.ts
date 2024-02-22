import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  LoginUserDto,
  RegisterUserDto,
  UpdateUserDto,
  UpgradeUserRoleDto,
} from '../dtos/auth.dto';
import { AuthGaurd } from './guards/authentication.guard';

@ApiTags('auth-endpoints')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a user' })
  registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log a user in' })
  loginUser(@Body() dto: LoginUserDto) {
    return this.authService.loginUser(dto);
  }

  @UseGuards(AuthGaurd)
  @ApiSecurity('JWT-auth')
  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.email, dto);
  }

  @UseGuards(AuthGaurd)
  @ApiSecurity('JWT-auth')
  @Patch('update-user')
  @ApiOperation({ summary: 'update user details' })
  updateUser(@Req() req, @Body() dto: UpdateUserDto) {
    return this.authService.updateUser(req.user.email, dto);
  }

  // use a roles guards
  @UseGuards(AuthGaurd)
  @ApiSecurity('JWT-auth')
  @Patch('upgrade-user')
  @ApiOperation({ summary: 'upgrade user to admin' })
  upgradeUserToAdmin(@Req() req, @Body() dto: UpgradeUserRoleDto) {
    return this.authService.upgradeUserToAdmin(req.user.email, dto);
  }
}

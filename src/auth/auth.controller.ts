import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from 'src/dtos/auth.dto';

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
}

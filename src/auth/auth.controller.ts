import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './DTO/register.dto';
import { LoginDTO } from './DTO/login.dto';
import { VerifyEmailDTO } from './DTO/verify-email.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({default: {limit: 3, ttl: 60_000}})       // max 3 registros/ min por cada ip
  register(@Body() registerDTO: RegisterDTO) {
    return this.authService.register(registerDTO);
  }

  @Post('verify-email')
  @Throttle({default: {limit: 10, ttl: 60_000}})
  verifyEmail(@Body() emailDTO: VerifyEmailDTO) {
    return this.authService.verifyEmail(emailDTO);
  }

  @Post('login')
  @Throttle({default: {limit: 5, ttl: 60_000}})
  login(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO);
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './DTO/register.dto';
import { LoginDTO } from './DTO/login.dto';
import { VerifyEmailDTO } from './DTO/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDTO: RegisterDTO) {
    return this.authService.register(registerDTO);
  }

  @Post('verify-email')
  verifyEmail(@Body() emailDTO: VerifyEmailDTO) {
    return this.authService.verifyEmail(emailDTO);
  }

  @Post('login')
  login(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO);
  }
}

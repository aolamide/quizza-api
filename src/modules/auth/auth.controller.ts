import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { sendSuccess } from '../../utils/response.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    await this.authService.registerUser(createUserDto);
    return sendSuccess(
      null,
      'Registration successful. Verify your email to activate your account.',
    );
  }
}

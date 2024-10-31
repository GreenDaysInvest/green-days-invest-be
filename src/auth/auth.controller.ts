// src/auth/auth.controller.ts
import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('surname') surname: string,
    @Body('email') email: string,
    @Body('phoneNumber') phoneNumber: string,
    @Body('password') password?: string,
  ) {
    const userExists = await this.authService.checkUserExists(email);

    if (userExists) {
      throw new ConflictException('User already registered. Please log in.');
    }

    return this.authService.register(
      name,
      surname,
      email,
      phoneNumber,
      password,
    );
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }
}

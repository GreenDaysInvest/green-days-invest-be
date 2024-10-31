// src/auth/auth.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async checkUserExists(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);
    return !!user;
  }

  async register(
    uid: string,
    name: string,
    surname: string,
    email: string,
    phoneNumber: string,
  ): Promise<User> {
    try {
      return await this.userService.createUser({
        uid,
        name,
        surname,
        email,
        phoneNumber,
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value')
      ) {
        throw new ConflictException('User already registered. Please log in.');
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userService.findByEmail(email);
    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      return this.jwtService.sign({ userId: user.id });
    }
    throw new Error('Invalid credentials');
  }
}

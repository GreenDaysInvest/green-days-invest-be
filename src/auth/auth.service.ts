// src/auth/auth.service.ts
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import admin from '../firebase-admin';
import { throwError } from 'rxjs';

@Injectable()
export class AuthService {
  [x: string]: any;
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
    password?: string,
    isAdmin?: boolean,
  ): Promise<{ token: string; user: Partial<User> }> {
    if (await this.userService.findByEmail(email)) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const user = await this.userService.createUser({
      uid,
      name,
      surname,
      email,
      phoneNumber,
      password: hashedPassword,
      isAdmin,
    });

    const token = this.jwtService.sign({ userId: user.id });

    // Return only non-sensitive user data and the token
    return {
      token,
      user: {
        uid: user.uid,
        name: user.name,
        surname: user.surname,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: Partial<User> }> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = this.jwtService.sign({ userId: user.id });

        // Return only non-sensitive user data and the token
        return {
          token,
          user: {
            uid: user.uid,
            name: user.name,
            surname: user.surname,
            email: user.email,
            isAdmin: user.isAdmin,
            questionnaires: user.questionnaires,
          },
        };
      }
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async verifyFirebaseToken(token: string): Promise<User> {
    const decodedToken = await admin.auth().verifyIdToken(token);
    let user = await this.userService.findByEmail(decodedToken.email);
    if (!user) {
      // Create user if they don't exist
      user = await this.userService.createUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        surname: decodedToken.surname,
        providerId: 'firebase',
      });
    }
    return user;
  }

  async loginWithFirebase(
    token: string,
  ): Promise<{ token: string; user: Partial<User> }> {
    const decodedToken = await admin.auth().verifyIdToken(token); // Verify the token
    const email = decodedToken.email;

    // Check if user already exists
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        'User not registered. Please register first.',
      );
    }
    const _token = this.jwtService.sign({ userId: user.id });
    // Return JWT token
    return {
      token: _token,
      user: {
        uid: user.uid,
        name: user.name,
        surname: user.surname,
        email: user.email,
        isAdmin: user.isAdmin,
        questionnaires: user.questionnaires,
      },
    };
  }

  async getUserProfile(_user: { userId: string }): Promise<Partial<User>> {
    const id = _user.userId;
    if (typeof id !== 'string') {
      throw new Error('Invalid user ID format');
    }

    const user = await this.userService.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    // Return only non-sensitive user data
    return {
      id: user.id,
      uid: user.uid,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      providerId: user.providerId,
      street: user.street,
      country: user.country,
      zip: user.zip,
      isAdmin: user.isAdmin,
    };
  }

  async updateUser(
    user: { userId: string },
    userData: Partial<Omit<User, 'email'>>,
  ): Promise<User> {
    const id = user.userId;
    // You can add additional checks or transformations here if needed
    return this.userService.updateUser(id, userData); // Call UserService to handle the update
  }
}

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
import { FirebaseAdminService } from '../firebase-admin';

@Injectable()
export class AuthService {
  [x: string]: any;
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly firebaseAdmin: FirebaseAdminService,
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
    birthdate?: Date,
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
      birthdate,
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
        birthdate: user.birthdate,
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
        const token = this.jwtService.sign({
          userId: user.id,
          isAdmin: user.isAdmin,
        });

        // Return only non-sensitive user data and the token
        return {
          token,
          user: {
            uid: user.uid,
            name: user.name,
            surname: user.surname,
            email: user.email,
            birthdate: user.birthdate,
            isAdmin: user.isAdmin,
            questionnaires: user.questionnaires,
          },
        };
      }
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async validateFirebaseToken(token: string) {
    try {
      const decodedToken = await this.firebaseAdmin.getAuth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      console.error('Error validating Firebase token:', error);
      return null;
    }
  }

  async loginWithFirebase(
    token: string,
  ): Promise<{ token: string; user: Partial<User> }> {
    const decodedToken = await this.validateFirebaseToken(token);
    if (!decodedToken) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
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
      throw new ConflictException('Invalid user ID format');
    }

    const user = await this.userService.findById(id);
    if (!user) {
      throw new ConflictException('User not found');
    }
    // Return only non-sensitive user data
    return {
      id: user.id,
      uid: user.uid,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      birthdate: user.birthdate,
      providerId: user.providerId,
      street: user.street,
      city: user.city,
      zip: user.zip,
      isAdmin: user.isAdmin,
      questionnaires: user.questionnaires,
      isVerified: user.isVerified,
      verifiedAt: user.verifiedAt,
      stripeCustomerId: user.stripeCustomerId,
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

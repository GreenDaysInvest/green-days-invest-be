// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import admin from 'firebase-admin';

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
    password: string,
    isAdmin?: boolean,
  ): Promise<{ token: string; user: Partial<User> }> {
    const hashedPassword = await bcrypt.hash(password, 10);
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

  ///= mos e harro mi kqyr kta
  async loginWithFirebase(token: string): Promise<string> {
    const decodedToken = await admin.auth().verifyIdToken(token); // Verify the token
    const email = decodedToken.email;
    const uid = decodedToken.uid;
    const name = decodedToken.name || decodedToken.given_name; // Fallback to given_name if name is not available
    const surname = decodedToken.family_name; // Assuming family_name is used for surname

    // Check if user already exists
    let user = await this.userService.findByEmail(email);
    if (!user) {
      // If user does not exist, create a new user
      user = await this.userService.createUser({
        uid,
        email,
        name,
        surname,
        providerId: 'firebase', // Indicate that this user is from Firebase
      });
    }

    // Return JWT token
    return this.jwtService.sign({ userId: user.id }); // Sign and return the token
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

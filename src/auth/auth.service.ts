// src/auth/auth.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { FirebaseAdminService } from '../firebase-admin';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  [x: string]: any;
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly emailService: EmailService,
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

    // Send welcome email
    try {
      await this.emailService.sendEmail(
        email,
        'Willkommen bei Cannabiz Reprezente 24',
        `Hallo ${name},\n\nWillkommen bei Cannabiz Reprezente 24! Wir freuen uns, Sie an Bord zu haben.`,
        `
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 20px 0;">
            <tr>
              <td align="center">
                <table
                  width="600"
                  cellpadding="0"
                  cellspacing="0"
                  style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"
                >
                  <!-- Logo Section -->
                  <tr>
                    <td align="center" style="background-color: #f3f3f3; padding: 20px;">
                      <img
                        src="https://www.cannabisrezepte24.de/logo.png"
                        alt="Cannabiz Reprezente 24 Logo"
                        width="200"
                      />
                    </td>
                  </tr>
                  <!-- Content Section -->
                  <tr>
                    <td style="padding: 20px;">
                      <h2 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Willkommen bei Cannabiz Reprezente 24!</h2>
                      <p style="color: #555555; line-height: 1.6; margin-bottom: 15px;">
                        Hallo ${name},
                      </p>
                      <p style="color: #555555; line-height: 1.6; margin-bottom: 15px;">
                        Wir freuen uns sehr, Sie bei Cannabiz Reprezente 24 begrüßen zu dürfen!
                      </p>
                      <p style="color: #555555; line-height: 1.6; margin-bottom: 15px;">Mit Ihrem neuen Konto können Sie:</p>
                      <ul style="list-style-type: none; padding: 0;">
                        <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
                          <span style="font-weight: bold; position: absolute; left: 0;">•</span> Ihre Medikamente zur Überprüfung einreichen
                        </li>
                        <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
                          <span style="font-weight: bold; position: absolute; left: 0;">•</span> Den Status Ihrer Einreichungen verfolgen
                        </li>
                        <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
                          <span style="font-weight: bold; position: absolute; left: 0;">•</span> Mit unserem Team kommunizieren
                        </li>
                      </ul>
                      <p style="color: #555555; line-height: 1.6; margin-bottom: 15px;">Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
                     
                      <p style="color: #555555; line-height: 1.6;">
                        Mit freundlichen Grüßen,<br />
                        Ihr Cannabiz Reprezente 24 Team
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw the error as registration was successful
    }

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

  async deleteUser(id: string): Promise<void> {
    const user = await this.userService.findById(id);
  
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
    // Delete the user from the database
    const deleteFromDatabase = async () => {
      await this.userService.deleteUser(id);
      console.log(`User ${id} successfully deleted from the database.`);
    };
  
    // If the user has a Firebase UID and no password, attempt to delete from Firebase
    if (user.uid && !user.password) {
      try {
        // Get a new instance of auth
        const auth = this.firebaseAdmin.getAuth();
  
        if (!auth) {
          console.warn(
            'Firebase Admin not initialized. Proceeding with database deletion only.'
          );
          await deleteFromDatabase();
          return;
        }

        try {
          // First verify if the user exists in Firebase
          await auth.getUser(user.uid)
            .then(async () => {
              // User exists in Firebase, proceed with deletion
              await auth.deleteUser(user.uid);
              console.log(`User ${user.uid} successfully deleted from Firebase.`);
              await deleteFromDatabase();
            })
            .catch(async (error) => {
              if (error.code === 'auth/user-not-found') {
                console.warn(
                  `User ${user.uid} not found in Firebase. Proceeding with database deletion.`
                );
                await deleteFromDatabase();
              } else {
                throw error;
              }
            });
        } catch (firebaseError) {
          if (firebaseError.code === 'auth/invalid-credential' ||
              firebaseError.message?.includes('failed to fetch a valid Google OAuth2 access token')) {
            console.error('Firebase credentials error:', firebaseError.message);
            console.warn(
              'Proceeding with database deletion despite Firebase authentication error.'
            );
            await deleteFromDatabase();
          } else {
            // Re-throw other Firebase errors
            console.error(
              `Failed to delete user ${user.uid} from Firebase:`,
              firebaseError
            );
            throw firebaseError;
          }
        }
      } catch (error) {
        console.error('Firebase service error:', error.message);
        // If there's any error with Firebase, still proceed with database deletion
        await deleteFromDatabase();
      }
    } else {
      // For users created through normal registration, just delete from our database
      await deleteFromDatabase();
    }
  }
  
}

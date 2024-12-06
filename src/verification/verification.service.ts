import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

type VerificationStatus = 
  | 'requires_input'
  | 'processing'
  | 'verified'
  | 'canceled'
  | 'requires_input'
  | 'failed';

@Injectable()
export class VerificationService {
  private stripe: Stripe;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async createVerificationSession(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is not set');
    }

    // Create a verification session
    const session = await this.stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        user_id: userId,
      },
      // return_url: `${frontendUrl}/dashboard`,
      options: {
        document: {
          require_id_number: true,
          require_matching_selfie: false,
          allowed_types: ['driving_license', 'passport', 'id_card'],
        },
      },
    });

    return {
      clientSecret: session.client_secret,
      url: session.url,
    };
  }

  async getVerificationStatus(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    try {
      console.log(userId,"userId");
      // Get the latest verification session for this user
      const sessions = await this.stripe.identity.verificationSessions.list();
      const latestSession = sessions.data.find(
        session => session.metadata?.user_id === userId
      );
      console.log(latestSession,"latestSession");
      
      if (!latestSession) {
        return {
          isVerified: user.isVerified,
          error: null,
        };
      }

      let error = null;
      
      if (!user.isVerified) {
        const status = latestSession.status as VerificationStatus;
        switch (status) {
          case 'requires_input':
            // Don't treat this as an error during initial verification
            if (latestSession.last_error) {
              error = latestSession.last_error.code 
                ? `Verification error: ${latestSession.last_error.code}`
                : 'Additional information required. Please try again.';
            }
            break;
          case 'processing':
            error = 'Verification is still processing';
            break;
          case 'verified':
            // If session is verified but user is not, they must be under 18
            error = 'User must be 18 or older to proceed';
            break;
          case 'canceled':
            error = 'Verification was canceled';
            break;
          case 'failed':
            error = latestSession.last_error?.code 
              ? `Verification failed: ${latestSession.last_error.code}`
              : 'Verification failed';
            break;
          default:
            error = 'Verification failed';
        }
      }

      return {
        isVerified: user.isVerified,
        error,
        status: latestSession.status
      };
    } catch (error) {
      console.error('Error fetching verification sessions:', error);
      return {
        isVerified: user.isVerified,
        error: 'Error checking verification status',
      };
    }
  }
}

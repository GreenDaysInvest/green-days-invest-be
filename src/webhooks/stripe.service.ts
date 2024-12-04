import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly userService: UserService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'identity.verification_session.verified':
      case 'identity.verification_session.requires_input': {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        await this.handleVerificationSessionUpdate(session);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleVerificationSessionUpdate(
    session: Stripe.Identity.VerificationSession,
  ): Promise<void> {
    const userId = session.metadata?.user_id;
    if (!userId) {
      throw new Error('User ID not found in session metadata');
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    switch (session.status) {
      case 'verified': {
        try {
          if (!session.last_verification_report || typeof session.last_verification_report !== 'string') {
            throw new Error('No valid verification report ID found');
          }

          const report = await this.stripe.identity.verificationReports.retrieve(
            session.last_verification_report
          );

          const documentDob = report.document?.dob;
          if (documentDob) {
            // Convert the date components to a Date object
            const stripeDobDate = new Date(
              documentDob.year,
              documentDob.month - 1, // JavaScript months are 0-based
              documentDob.day
            );

            const isValidAge = this.isUserOver18(stripeDobDate, user.birthdate);

            await this.userService.updateUser(user.id, {
              isVerified: isValidAge,
              verifiedAt: isValidAge ? new Date() : null,
            });
          } else {
            console.error('No DOB found in verification report');
            await this.userService.updateUser(user.id, {
              isVerified: false,
              verifiedAt: null,
            });
          }
        } catch (error) {
          console.error('Error processing verification report:', error);
          throw error;
        }
        break;
      }
      case 'requires_input':
        await this.userService.updateUser(user.id, {
          isVerified: false,
          verifiedAt: null,
        });
        break;
      default:
        console.log(`Unhandled verification status: ${session.status}`);
    }
  }

  private isUserOver18(stripeDob: Date, userDob: Date): boolean {
    // Compare the dates
    if (stripeDob.getTime() !== userDob.getTime()) {
      return false; // Dates don't match
    }

    const today = new Date();
    const age = today.getFullYear() - stripeDob.getFullYear();
    const monthDiff = today.getMonth() - stripeDob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < stripeDob.getDate())) {
      return age - 1 >= 18;
    }
    
    return age >= 18;
  }
}

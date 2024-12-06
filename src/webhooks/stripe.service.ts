import { Injectable, OnModuleInit } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe: Stripe;
  private stripeIdentity: Stripe;
  private webhookSecret: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    const identityKey = this.configService.get<string>('stripe.identityKey');
    this.webhookSecret = this.configService.get<string>('stripe.webhookSecret');

    if (!secretKey) {
      throw new Error('Stripe-Geheimnis ist nicht in den Umgebungsvariablen definiert');
    }

    if (!identityKey) {
      throw new Error('Stripe-Identitäts-Geheimnis ist nicht in den Umgebungsvariablen definiert');
    }

    if (!this.webhookSecret) {
      console.warn('Stripe-Webhook-Geheimnis ist nicht in den Umgebungsvariablen definiert');
    }

    console.log(`Running in ${this.configService.get('nodeEnv')} mode`);

    // General Stripe instance
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Identity-specific Stripe instance with restricted key
    this.stripeIdentity = new Stripe(identityKey, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    if (!this.webhookSecret) {
      throw new Error('Webhook-Geheimnis ist nicht konfiguriert');
    }
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  async handleEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'identity.verification_session.verified':
        await this.handleVerificationSessionUpdate(event.data.object as Stripe.Identity.VerificationSession);
        break;
      case 'identity.verification_session.created':
      case 'identity.verification_session.processing':
      case 'file.created':
        console.log(`Unhandled event type: ${event.type}`);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  async handleVerificationSessionUpdate(session: Stripe.Identity.VerificationSession) {
    console.log('Received verification session update:', session);

    if (session.status === 'verified' && session.last_verification_report) {
      try {
        // Use stripeIdentity instance for verification report retrieval
        const report = await this.stripeIdentity.identity.verificationReports.retrieve(
          session.last_verification_report as string,
          {
            expand: ['document.dob']
          }
        );

        console.log('Full verification report:', JSON.stringify(report, null, 2));
        console.log('Document data:', report.document);
        
        // Extract DOB from the report's sensitive data
        const documentDob = report.document?.dob;
        console.log('Document DOB:', documentDob);

        if (documentDob && typeof documentDob === 'object') {
          const userId = session.metadata?.user_id;
          console.log('User ID:', userId);

          if (userId) {
            const user = await this.userRepository.findOne({
              where: { id: userId },
              relations: ['questionnaires'],
            });

            if (user) {
              // Convert DOB to Date object using the Stripe DOB object
              const stripeDob = new Date(
                documentDob.year,
                documentDob.month - 1, // JavaScript months are 0-based
                documentDob.day
              );

              // Compare with existing birthdate
              if (!user.birthdate || user.birthdate.getTime() !== stripeDob.getTime()) {
                console.log('Updating user birthdate from Stripe Identity verification');
                console.log('Old birthdate:', user.birthdate);
                console.log('New birthdate:', stripeDob);
                user.birthdate = stripeDob;
              }

              const age = this.calculateAge(stripeDob);
              console.log('Calculated age:', age);

              if (age >= 18) {
                user.isVerified = true;
                user.verifiedAt = new Date();
                await this.userRepository.save(user);
                console.log('Benutzer erfolgreich verifiziert');
              } else {
                user.isVerified = false;
                user.verifiedAt = null;
                await this.userRepository.save(user);
                console.log('Benutzerverifizierung fehlgeschlagen: Mindestalter nicht erreicht');
              }
            }
          }
        } else {
          console.log('Kein gültiges Geburtsdatum im Verifizierungsbericht gefunden');
          // Set user as unverified if no DOB found
          const userId = session.metadata?.user_id;
          if (userId) {
            await this.userRepository.update(userId, {
              isVerified: false,
              verifiedAt: null,
            });
          }
        }
      } catch (error) {
        console.error('Fehler bei der Verarbeitung des Verifizierungsberichts:', error);
        // Set user as unverified on error
        const userId = session.metadata?.user_id;
        if (userId) {
          await this.userRepository.update(userId, {
            isVerified: false,
            verifiedAt: null,
          });
        }
      }
    }
  }
}

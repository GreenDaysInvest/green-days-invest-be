import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Questionnaire } from 'src/questionnaire/questionnaire.entity';
import { BasketItem } from 'src/basket/basket.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  uid: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  providerId: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  zip: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  })
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';

  @Column({ nullable: true })
  verificationDocumentUrl: string; // URL of uploaded document for verification

  @Column({ nullable: true, type: 'timestamp' })
  verificationDate: Date; // Timestamp when verification status was updated

  @Column({ nullable: true, unique: true })
  stripeCustomerId: string; // Securely store Stripe Customer ID for payments

  @Column({ nullable: true, unique: true })
  stripePaymentMethodId: string; // Optional: store default payment method ID (encrypted)

  @OneToMany(() => Questionnaire, (questionnaire) => questionnaire.user)
  questionnaires: Questionnaire[];

  @OneToMany(() => BasketItem, (basketItem) => basketItem.user, {
    cascade: true,
  })
  basket: BasketItem[];
}

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

  @Column({ nullable: true, type: 'date' })
  birthdate: Date;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  providerId: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  zip: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true, unique: true })
  stripeCustomerId: string; // Securely store Stripe Customer ID for payments and for identity verification

  @Column({ default: false })
  isVerified: boolean; // Indicates if the user is verified by Stripe

  @Column({ nullable: true, type: 'timestamp' })
  verifiedAt: Date; // Timestamp of successful verification

  @OneToMany(() => Questionnaire, (questionnaire) => questionnaire.user)
  questionnaires: Questionnaire[];

  @OneToMany(() => BasketItem, (basketItem) => basketItem.user, {
    cascade: true,
  })
  basket: BasketItem[];
}

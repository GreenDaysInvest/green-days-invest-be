// src/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Questionnaire } from '../questionnaire/questionnaire.entity';

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

  // Adding the one-to-many relationship
  @OneToMany(() => Questionnaire, (questionnaire) => questionnaire.user)
  questionnaires: Questionnaire[];
}

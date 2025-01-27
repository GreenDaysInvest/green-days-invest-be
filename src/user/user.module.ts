// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { FirebaseAdminService } from 'src/firebase-admin';
import { UserController } from './user.controller';
import { Questionnaire } from '../questionnaire/questionnaire.entity';
import { BasketItem } from '../basket/basket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Questionnaire, BasketItem])],
  providers: [UserService, FirebaseAdminService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}

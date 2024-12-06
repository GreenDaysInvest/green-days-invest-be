import { Module } from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Flower } from 'src/flower/flower.entity';
import { AuthModule } from 'src/auth/auth.module';
import { BasketItem } from './basket.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Flower, BasketItem]),
    AuthModule,
  ],
  controllers: [BasketController],
  providers: [BasketService, JwtAuthGuard],
})
export class BasketModule {}

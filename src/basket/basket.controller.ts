import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Get,
  Patch,
} from '@nestjs/common';
import { BasketService } from './basket.service';
import { Flower } from 'src/flower/flower.entity';
import { User as UserDecorator } from '../user/user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('basket')
export class BasketController {
  constructor(private basketService: BasketService) {}

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async getBasket(@UserDecorator('userId') user: { userId: string }) {
    console.log('User ID:', user.userId);
    return this.basketService.getBasket(user.userId);
  }

  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  async addToBasket(
    @UserDecorator('userId') user: { userId: string },
    @Body() flowerData: Partial<Flower>,
  ) {
    console.log('User ID:', user.userId);
    console.log('FlowerData:', flowerData);
    return this.basketService.addToBasket(user.userId, flowerData);
  }

  @Delete(':userId/:flowerId')
  @UseGuards(JwtAuthGuard)
  async removeFromBasket(
    @UserDecorator('userId') user: { userId: string },
    @Param('flowerId') flowerId: string,
  ) {
    console.log('User ID:', user.userId);
    console.log('Flower ID:', flowerId);
    return this.basketService.removeFromBasket(user.userId, flowerId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId/update')
  async updateItemQuantity(
    @Param('userId') userId: string,
    @Body() updateData: { itemId: string; quantity: number },
  ) {
    const { itemId, quantity } = updateData;
    return this.basketService.updateItemQuantity(userId, itemId, quantity);
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  async clearBasket(@Param('userId') userId: string) {
    console.log('Clearing basket for User ID:', userId);
    await this.basketService.clearBasket(userId);
    return { message: 'Basket cleared successfully' };
  }
}

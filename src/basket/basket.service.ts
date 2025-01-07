import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flower } from '../flower/flower.entity';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { BasketItem } from './basket.entity';

@Injectable()
export class BasketService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Flower) private flowerRepository: Repository<Flower>,
    @InjectRepository(BasketItem)
    private basketItemRepository: Repository<BasketItem>,
  ) {}

  async getBasket(userId: string): Promise<BasketItem[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['basket', 'basket.flower'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.basketItemRepository.find({
      where: { user: { id: userId } },
      relations: ['flower'],
      order: { id: 'ASC' },
    });
  }

  async addToBasket(
    userId: string,
    flowerData: Partial<Flower>,
    quantity = 1,
  ): Promise<BasketItem[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['basket', 'basket.flower'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let flower = await this.flowerRepository.findOne({
      where: { id: flowerData.id },
    });

    if (!flower) {
      flower = this.flowerRepository.create(flowerData);
      await this.flowerRepository.save(flower);
    }

    let basketItem = user.basket.find((item) => item.flower.id === flower.id);
    if (basketItem) {
      basketItem.quantity += quantity;
      await this.basketItemRepository.save(basketItem);
    } else {
      basketItem = this.basketItemRepository.create({
        user,
        flower,
        quantity,
      });
      await this.basketItemRepository.save(basketItem);
    }

    return this.getBasket(userId);
  }

  async removeFromBasket(
    userId: string,
    flowerId: string,
  ): Promise<BasketItem[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['basket', 'basket.flower'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const basketItem = user.basket.find((item) => item.flower.id === flowerId);
    if (!basketItem) {
      throw new NotFoundException('Flower not found in basket');
    }

    await this.basketItemRepository.remove(basketItem);

    return this.getBasket(userId);
  }

  async updateItemQuantity(
    userId: string,
    itemId: string,
    quantity: number,
  ): Promise<BasketItem[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['basket', 'basket.flower'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const basketItem = user.basket.find((item) => item.flower.id === itemId);
    if (!basketItem) {
      throw new NotFoundException('Item not found in basket');
    }

    // Update quantity or remove item if quantity is 0
    if (basketItem.quantity + quantity <= 0) {
      // Remove the item if quantity drops to 0
      await this.basketItemRepository.remove(basketItem);
    } else {
      // Update the quantity
      basketItem.quantity += quantity;
      await this.basketItemRepository.save(basketItem);
    }

    // Return the updated basket
    return await this.basketItemRepository.find({
      where: { user: { id: userId } },
      relations: ['flower'],
      order: { id: 'ASC' },
    });
  }

  async clearBasket(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['basket'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove all basket items for the user
    await this.basketItemRepository.remove(user.basket);
  }
}

// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { Questionnaire } from '../questionnaire/questionnaire.entity';
import { BasketItem } from '../basket/basket.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(BasketItem)
    private readonly basketItemRepository: Repository<BasketItem>,
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['questionnaires'],
    });
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    if (!id) {
      throw new NotFoundException('User ID is required for updating the user');
    }
    if (userData.password) {
      // If password is provided, hash it before saving
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const updateResult = await this.userRepository.update(id, userData);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.findOne({ where: { id } });
  }

  //create delete user
  async deleteUser(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Start a transaction to ensure all deletions succeed or none do
    await this.userRepository.manager.transaction(async transactionalEntityManager => {
      // Delete related questionnaires
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(Questionnaire)
        .where("userId = :userId", { userId: id })
        .execute();

      // Delete related basket items
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(BasketItem)
        .where("userId = :userId", { userId: id })
        .execute();

      // Finally, delete the user
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(User)
        .where("id = :id", { id })
        .execute();
    });
  }
}

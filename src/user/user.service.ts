// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    if (userData.password) {
      // If password is provided, hash it before saving
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    await this.userRepository.update(id, userData);
    return this.userRepository.findOne({ where: { id } });
  }
}

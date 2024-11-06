// src/questionnaire/questionnaire.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
  ) {}

  async createQuestionnaire(
    data: Partial<Questionnaire>,
  ): Promise<Questionnaire> {
    const questionnaire = this.questionnaireRepository.create(data);
    return this.questionnaireRepository.save(questionnaire);
  }

  async findByUserId(userId: string): Promise<Questionnaire[]> {
    return this.questionnaireRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findAll(): Promise<Questionnaire[]> {
    return this.questionnaireRepository.find({ relations: ['user'] }); // Include user information if needed
  }

  // Add a method to update a questionnaire if required
  async updateQuestionnaire(
    id: string,
    data: Partial<Questionnaire>,
  ): Promise<Questionnaire> {
    await this.questionnaireRepository.update(id, data);
    return this.questionnaireRepository.findOne({ where: { id } });
  }
}

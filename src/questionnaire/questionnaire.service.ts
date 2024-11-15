import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
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

  async updateStatus(
    id: string,
    status: 'accepted' | 'declined',
  ): Promise<Questionnaire> {
    await this.questionnaireRepository.update(id, { status });
    return this.questionnaireRepository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Questionnaire[]> {
    return this.questionnaireRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findAll(): Promise<Questionnaire[]> {
    return this.questionnaireRepository.find({ relations: ['user'] });
  }

  async searchByUserDetails(query: string): Promise<Questionnaire[]> {
    const lowerCaseQuery = query.toLocaleLowerCase();

    return this.questionnaireRepository.find({
      where: [
        { user: { name: Like(`%${lowerCaseQuery}%`) } },
        { user: { surname: Like(`%${lowerCaseQuery}%`) } },
        { user: { email: Like(`%${lowerCaseQuery}%`) } },
      ],
      relations: ['user'],
    });
  }

  async updateQuestionnaire(
    id: string,
    data: Partial<Questionnaire>,
  ): Promise<Questionnaire> {
    await this.questionnaireRepository.update(id, data);
    return this.questionnaireRepository.findOne({ where: { id } });
  }
}

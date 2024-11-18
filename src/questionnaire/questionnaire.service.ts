import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    private readonly emailService: EmailService,
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
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!questionnaire) {
      throw new Error('Questionnaire not found');
    }

    questionnaire.status = status;
    const updatedQuestionnaire = await this.questionnaireRepository.save(
      questionnaire,
    );

    // Send email to user
    const subject =
      status === 'accepted'
        ? 'Your Medication Has Been Accepted'
        : 'Your Medication Has Been Declined';
    const text =
      status === 'accepted'
        ? `Hello ${questionnaire.user.name}, your medication has been accepted.`
        : `Hello ${questionnaire.user.name}, unfortunately, your medication has been declined.`;

    try {
      await this.emailService.sendEmail(
        questionnaire.user.email,
        subject,
        text,
      );
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    return updatedQuestionnaire;
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
}

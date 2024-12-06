import { ConflictException, Injectable } from '@nestjs/common';
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
      throw new ConflictException('Fragebogen nicht gefunden');
    }

    questionnaire.status = status;
    const updatedQuestionnaire = await this.questionnaireRepository.save(
      questionnaire,
    );

    // Send email to user
    const subject =
      status === 'accepted'
        ? 'Ihr Medikament wurde abgelehnt'
        : 'Ihr Medikament wurde abgelehnt';
    const text =
      status === 'accepted'
        ? `Halo ${questionnaire.user.name}, Ihr Medikament wurde abgelehnt.`
        : `Halo ${questionnaire.user.name}, leider wurde, Ihr Medikament abgelehnt.`;

    try {
      await this.emailService.sendEmail(
        questionnaire.user.email,
        subject,
        text,
        `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Benachrichtigung über den Status Ihres Medikaments</h2>
          <p>${text}</p>
          <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
          <p>Mit freundlichen Grüßen,<br>Ihr Green Days Team</p>
        </div>`
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
    return this.questionnaireRepository.find({ relations: ['user'], order: { createdAt: 'DESC' } });
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

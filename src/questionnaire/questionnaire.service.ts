import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { EmailService } from '../email/email.service';

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
        ? 'Ihr Medikament wurde zugelassen'
        : 'Ihr Medikament wurde abgelehnt';
    const text =
      status === 'accepted'
        ? `Halo ${questionnaire.user.name}, Ihr Medikament wurde zugelassen.`
        : `Halo ${questionnaire.user.name}, leider wurde, Ihr Medikament abgelehnt.`;

    try {
      await this.emailService.sendEmail(
        questionnaire.user.email,
        subject,
        text,
        `
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 20px 0;">
            <tr>
              <td align="center">
                <table
                  width="600"
                  cellpadding="0"
                  cellspacing="0"
                  style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"
                >
                  <!-- Logo Section -->
                  <tr>
                    <td align="center" style="background-color: #f3f3f3; padding: 20px;">
                      <img
                        src="https://www.cannabisrezepte24.de/logo.png"
                        alt="Cannabiz Reprezente 24 Logo"
                        width="200"
                      />
                    </td>
                  </tr>
                  <!-- Content Section -->
                  <tr>
                    <td style="padding: 20px; font-family: Arial, sans-serif;">
                      <h2 style="color: #333333; font-size: 24px; margin-bottom: 20px;">
                        Benachrichtigung über den Status Ihres Medikaments
                      </h2>
                      <p style="color: #555555; line-height: 1.6; margin-bottom: 15px;">
                        ${text}
                      </p>
                      <p style="color: #555555; line-height: 1.6; margin-bottom: 15px;">
                        Bei Fragen stehen wir Ihnen gerne zur Verfügung.
                      </p>
                      <p style="color: #555555; line-height: 1.6;">
                        Mit freundlichen Grüßen,<br />
                        Ihr Cannabiz Reprezente 24 Team
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `
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

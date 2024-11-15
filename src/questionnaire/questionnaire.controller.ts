// src/questionnaire/questionnaire.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuestionnaireService } from './questionnaire.service';
import { User as UserDecorator } from '../user/user.decorator';
import { UserService } from '../user/user.service'; // Import UserService

@Controller('questionnaires')
export class QuestionnaireController {
  constructor(
    private readonly questionnaireService: QuestionnaireService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body()
    questionnaireData: { questions: { question: string; answer: string }[] },
    @UserDecorator('userId') _user: { userId: string },
  ) {
    // Fetch the full user object
    const user = await this.userService.findById(_user.userId); // Assuming this method exists

    return this.questionnaireService.createQuestionnaire({
      ...questionnaireData,
      user, // Attach the full user object to the questionnaire
    });
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserQuestionnaires(
    @UserDecorator('userId') user: { userId: string },
  ) {
    return this.questionnaireService.findByUserId(user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllQuestionnaires() {
    return this.questionnaireService.findAll();
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  async getQuestionnairesByUserId(@Param('id') userId: string) {
    return this.questionnaireService.findByUserId(userId);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchQuestionnaires(@Query('query') query: string) {
    return this.questionnaireService.searchByUserDetails(query);
  }

  @Patch(':id/accept')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async acceptQuestionnaire(@Param('id') id: string) {
    return this.questionnaireService.updateStatus(id, 'accepted');
  }

  @Patch(':id/decline')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async declineQuestionnaire(@Param('id') id: string) {
    return this.questionnaireService.updateStatus(id, 'declined');
  }
}

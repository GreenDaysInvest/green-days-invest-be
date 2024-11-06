// src/questionnaire/questionnaire.controller.ts
import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
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
  @UseGuards(JwtAuthGuard) // Optional: restrict to authenticated users
  async getAllQuestionnaires() {
    return this.questionnaireService.findAll();
  }

  @Get('user/:id') // New endpoint to get questionnaires by user ID
  @UseGuards(JwtAuthGuard) // Protect this route with the JWT guard
  async getQuestionnairesByUserId(@Param('id') userId: string) {
    return this.questionnaireService.findByUserId(userId); // Call service to get questionnaires for the user
  }
}

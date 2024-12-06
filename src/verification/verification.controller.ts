import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User as UserDecorator } from '../user/user.decorator';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('create-session')
  @UseGuards(JwtAuthGuard)
  async createVerificationSession(@UserDecorator('userId') _user: { userId: string }) {
    return this.verificationService.createVerificationSession(_user.userId);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getVerificationStatus(@UserDecorator('userId') _user: { userId: string }) {
    return this.verificationService.getVerificationStatus(_user.userId);
  }
}

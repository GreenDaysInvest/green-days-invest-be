import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  async uploadDocument(
    @Body() { documentUrl }: { documentUrl: string },
    @Body('userId') userId: string,
  ) {
    await this.verificationService.uploadDocument(userId, documentUrl);
    return { message: 'Document uploaded and under review' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  async updateStatus(
    @Param('userId') userId: string,
    @Body() { status }: { status: 'VERIFIED' | 'REJECTED' },
  ) {
    await this.verificationService.updateVerificationStatus(userId, status);
    return { message: `User verification status updated to ${status}` };
  }
}

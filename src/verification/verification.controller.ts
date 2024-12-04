import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { User as UserDecorator } from '../user/user.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
          return callback(new Error('Only image and PDF files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @UserDecorator('userId') user: { userId: string },
  ) {
    return await this.verificationService.uploadDocumentToStripe(file, user.userId);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getVerificationStatus(@UserDecorator('userId') user: { userId: string }) {
    return await this.verificationService.getVerificationStatus(user.userId);
  }
}

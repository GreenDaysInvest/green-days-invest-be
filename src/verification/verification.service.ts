import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class VerificationService {
  constructor(private readonly userService: UserService) {}

  async uploadDocument(userId: string, documentUrl: string): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.userService.updateUser(userId, {
      verificationDocumentUrl: documentUrl,
      verificationStatus: 'PENDING',
    });
  }

  async updateVerificationStatus(
    userId: string,
    status: 'VERIFIED' | 'REJECTED',
  ): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.userService.updateUser(userId, {
      verificationStatus: status,
      verificationDate: new Date(),
    });
  }
}

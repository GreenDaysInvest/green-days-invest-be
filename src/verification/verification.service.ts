import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class VerificationService {
  constructor(private readonly userService: UserService) {}

  async verifyUserAge(userId: string, dobFromDocument: Date): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isAbove18 = this.checkIfOlderThan18(dobFromDocument, user.birthdate);

    if (isAbove18) {
      await this.userService.updateUser(userId, {
        isVerified: true,
        verifiedAt: new Date(),
      });
    } else {
      throw new HttpException(
        'User is not above 18 years old',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private checkIfOlderThan18(documentDOB: Date, userDOB: Date): boolean {
    const today = new Date();
    const age = today.getFullYear() - documentDOB.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > documentDOB.getMonth() ||
      (today.getMonth() === documentDOB.getMonth() &&
        today.getDate() >= documentDOB.getDate());
    return age > 18 || (age === 18 && hasHadBirthdayThisYear);
  }
}

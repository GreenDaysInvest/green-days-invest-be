import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const canActivate = super.canActivate(context);
    if (!canActivate) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.isAdmin) {
      throw new ForbiddenException('Forbidden resource');
    }

    return true;
  }
}

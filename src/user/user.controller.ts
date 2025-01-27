import { Controller, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserDecorator } from './user.decorator'; 
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete('delete-account')
  @UseGuards(AuthGuard('jwt'))
  async deleteAccount(@UserDecorator('userId') user: { userId: string }) {
    await this.userService.deleteUser(user.userId);
    return { message: 'Account successfully deleted' };
  }
}
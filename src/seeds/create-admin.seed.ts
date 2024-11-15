import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  const email = 'admin@test.com'; // Admin email
  const existingAdmin = await userService.findByEmail(email);

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('123456789', 10); // Hash the password
    await userService.createUser({
      uid: 'admin_uid', // Unique identifier for the admin user
      name: 'admin',
      surname: 'test',
      email,
      password: hashedPassword,
      isAdmin: true,
    });
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }

  await app.close();
}

createAdmin();

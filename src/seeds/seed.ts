import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserRole } from '../user/enums/user-role.enum';
import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import * as argon2 from 'argon2';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepo = dataSource.getRepository(User);

  const email = 'superadmin@pedgo.com';
  const existing = await userRepo.findOne({ where: { email } });

  if (existing) {
    console.log('⚠️ SUPER_ADMIN já existe:', email);
    await app.close();
    return;
  }

  // ✅ Gere o hash com a mesma função usada no AuthService
  const hashedPassword = await argon2.hash('123456');

  const superAdmin = userRepo.create({
    name: 'Super Admin',
    email,
    password: hashedPassword,
    role: UserRole.SUPER_ADMIN,
  });

  await userRepo.save(superAdmin);
  console.log('✅ SUPER_ADMIN criado com sucesso:', superAdmin.email);
  await app.close();
}

bootstrap();

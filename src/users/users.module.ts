// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'; // 1. 引入 PassportModule
import { JwtStrategy } from './strategies/jwt.strategy'; // 2. 引入 JwtStrategy

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule, // 3. 导入 PassportModule
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'my_secret_key_change_this_in_production',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy], // 4. 在 providers 中注册 JwtStrategy
  exports: [UsersService],
})
export class UsersModule { }
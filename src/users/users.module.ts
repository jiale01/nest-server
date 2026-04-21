// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // 引入 TypeORM
import { User } from './entities/user.entity';   // 引入实体

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 关键：在这里注册实体
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
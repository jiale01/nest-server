// src/users/users.service.ts
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { CryptoUtil } from '../common/utils/crypto.util'; // 引入工具类

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // 1. 检查用户名是否存在
    const existingUser = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    let plainPassword: string;

    // 2. 【关键】AES 解密传输的密码
    try {
      // 假设前端传来的 password 字段已经是 AES 加密后的字符串
      plainPassword = CryptoUtil.decrypt(createUserDto.password);
    } catch (error) {
      throw new BadRequestException('密码格式错误或解密失败');
    }

    // 3. 【关键】Bcrypt 哈希存储
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 4. 创建并保存
    const user = this.usersRepository.create({
      username: createUserDto.username,
      nickname: createUserDto.nickname,
      password: hashedPassword, // 存双重处理后的密码
    });

    return await this.usersRepository.save(user);
  }
}
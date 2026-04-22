// src/users/users.service.ts
import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CryptoUtil } from '../common/utils/crypto.util';

// 假设你有一个 LoginDto，包含 username 和 password
// import { LoginDto } from './dto/login.dto'; 

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    let plainPassword: string;
    try {
      // 解密注册密码
      plainPassword = CryptoUtil.decrypt(createUserDto.password);
    } catch (error) {
      throw new BadRequestException('密码格式错误或解密失败');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const user = this.usersRepository.create({
      username: createUserDto.username,
      nickname: createUserDto.nickname,
      password: hashedPassword,
    });

    return await this.usersRepository.save(user);
  }

  // 修改 login 签名以接收 DTO 或明确参数来源
  async login(username: string, encryptedPassword: string) {
    const user = await this.usersRepository.findOne({
      where: { username: username },
    });

    if (!user) {
      // 安全提示：不要提示“用户不存在”，统一提示“用户名或密码错误”
      throw new UnauthorizedException('用户名或密码错误');
    }

    let plainPassword: string;
    try {
      // 【关键修改】解密登录密码
      plainPassword = CryptoUtil.decrypt(encryptedPassword);
    } catch (error) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 使用解密后的明文密码与数据库中的 Hash 比对
    const isPasswordValid = await bcrypt.compare(plainPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      }
    };
  }
}
// src/users/users.service.ts
import { Injectable, ConflictException, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CryptoUtil } from '../common/utils/crypto.util';
import { PageQuery, PageResult } from '../types/page';

// 假设你有一个 LoginDto，包含 username 和 password
// import { LoginDto } from './dto/login.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

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
      // 安全提示：不要提示"用户不存在"，统一提示"用户名或密码错误"
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

  // 获取所有用户（分页）
  async findAll(query: PageQuery): Promise<PageResult<Omit<User, 'password'>>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    // 构建查询条件
    const where: any = {};
    if (query.username) {
      where.username = Like(`%${query.username}%`);
    }

    const [list, total] = await this.usersRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    // 移除敏感字段
    const safeList = list.map(user => {
      const { password, ...result } = user;
      return result;
    }) as Omit<User, 'password'>[];

    return {
      list: safeList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    } as PageResult<Omit<User, 'password'>>;
  }

  // 获取单个用户
  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    // 移除敏感字段
    const { password, ...result } = user;
    return result;
  }

  // 更新用户信息
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    // 如果更新了用户名，检查是否与其他用户冲突
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 如果更新了密码，需要加密
    if (updateUserDto.password) {
      let plainPassword: string;
      try {
        plainPassword = CryptoUtil.decrypt(updateUserDto.password);
      } catch (error) {
        throw new BadRequestException('密码格式错误或解密失败');
      }

      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(plainPassword, salt);
    }

    // 合并更新数据
    Object.assign(user, updateUserDto);

    return await this.usersRepository.save(user);
  }

  // 删除用户
  async remove(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    await this.usersRepository.remove(user);
    return { message: '用户删除成功' };
  }

  // 获取当前用户信息（通过 JWT Token）
  async getProfile(userId: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 移除敏感字段
    const { password, ...result } = user;
    return result;
  }
}
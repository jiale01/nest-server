import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CryptoUtil } from '../common/utils/crypto.util';
import { Public } from './strategies/jwt-auth.guard';
import { PageQuery } from '../types/page';
import { JwtAuthGuard } from './strategies/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // 注册接口
  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 登录接口
  @Public()
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    return await this.usersService.login(body.username, body.password);
  }

  // 获取当前用户信息 - 需要 JWT 认证
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() request: Request) {
    // request.user 是由 JwtStrategy.validate() 返回的数据
    const user = request.user as { userId: number; username: string };
    return this.usersService.getProfile(user.userId);
  }

  // 获取所有用户（分页）- 需要认证
  @Get()
  findAll(@Query() query: PageQuery) {
    return this.usersService.findAll(query);
  }

  // 获取单个用户 - 需要认证
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // 更新用户信息 - 需要认证
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // 删除用户 - 需要认证
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
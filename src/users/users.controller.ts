import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CryptoUtil } from '../common/utils/crypto.util';
import { Public } from './strategies/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  // 注册接口
  @Public()
  @Post('register')
  // 1. 直接接收前端传来的加密密码，不要在这里解密
  register(@Body() createUserDto: CreateUserDto) {
    // 2. 直接把整个 DTO 丢给 Service
    return this.usersService.create(createUserDto);
  }

  // 登录接口
  @Public()
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    // return '登录成功，这是纯文本';
    return await this.usersService.login(body.username, body.password);
  }
  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}

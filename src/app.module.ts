// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// 1. 引入 TypeORM 模块
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // 2. 配置数据库连接
    TypeOrmModule.forRoot({
      type: 'mysql',                  // 数据库类型
      host: 'localhost',              // 你的 Docker 映射地址
      port: 3306,                     // 端口
      username: 'root',               // 用户名
      password: 'root',               // 密码
      database: 'my_nest_db',         // 刚才创建的数据库名
      entities: [],                   // 这里以后会放你的实体类（表结构）
      synchronize: true,              // 开发环境设为 true，自动同步表结构（生产环境务必设为 false）
      autoLoadEntities: true,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
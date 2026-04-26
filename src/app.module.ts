// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// 1. 引入 TypeORM 模块
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt'; // 引入 JwtModule
import { ArticleModule } from './article/article.module';
// 引入 ConfigModule
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // 配置环境变量模块 - 全局可用
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块，其他模块无需导入即可使用
      envFilePath: '.env', // 指定环境变量文件
    }),
    // 2. 配置数据库连接 - 使用环境变量
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 3306,
        username: configService.get<string>('DB_USERNAME') || 'root',
        password: configService.get<string>('DB_PASSWORD') || 'root',
        database: configService.get<string>('DB_DATABASE') || 'my_nest_db',
        entities: [],
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // 生产环境关闭自动同步
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    // ✅ JWT 全局配置 - 使用环境变量
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'my_secret_key_change_this_in_production',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }) as any,
      inject: [ConfigService],
      global: true, // 设置为全局模块
    }),
    UsersModule,
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
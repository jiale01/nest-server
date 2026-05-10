import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './users/strategies/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 设置全局API前缀
  app.setGlobalPrefix('api_v1');

  // 注册全局拦截器，统一响应格式
  app.useGlobalInterceptors(new TransformInterceptor());

  // 注册全局异常过滤器，统一错误响应格式
  app.useGlobalFilters(new HttpExceptionFilter());

  // 注册全局守卫
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

  // 从环境变量读取端口，默认3000
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
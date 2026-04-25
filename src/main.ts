import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './users/strategies/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 设置全局API前缀
  app.setGlobalPrefix('api_v1');
  
  // 注册全局拦截器，统一响应格式
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // 注册全局守卫
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
  
  await app.listen(3000);
}
bootstrap();

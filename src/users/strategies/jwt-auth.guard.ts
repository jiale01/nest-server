import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // 1. 必须引入 Reflector
import { AuthGuard } from '@nestjs/passport';

// 2. 定义 Key，建议放在这里或者单独的文件，只要统一即可
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => require('@nestjs/common').SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 3. 关键点：必须通过构造函数注入 reflector
  // 这样 app.useGlobalGuards(new JwtAuthGuard(reflector)) 才能正常工作
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // console.log('开始验证 JWT...');
    return super.canActivate(context);
  }
}
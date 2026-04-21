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
    // 4. 打印日志调试（可选，方便你看它到底有没有读到标记）
    // console.log('--- 守卫触发 ---');

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // 👇 加上这行日志，重启服务后再请求一次登录接口
    console.log('🔍 是否公开接口:', isPublic); 
    // 5. 如果读到是 Public，打印一下并放行
    if (isPublic) {
      // console.log('放行公开接口');
      return true;
    }

    // console.log('开始验证 JWT...');
    return super.canActivate(context);
  }
}
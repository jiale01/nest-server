import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'my_secret_key_change_this_in_production',
    });
  }

  async validate(payload: any) {
    // payload 是 JWT 解密后的内容
    // 这里返回的内容会被注入到 Request 对象中，可以通过 req.user 访问
    return { userId: payload.sub, username: payload.username };
  }
}

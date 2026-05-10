import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { Public } from '../users/strategies/jwt-auth.guard';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * 获取博客列表（公开接口，无需JWT认证）
   */
  @Public()
  @Get('list')
  getBlogList(@Query() query?: any) {
    return this.blogService.getBlogList(query);
  }

  /**
   * 获取博客详情（公开接口，无需JWT认证）
   */
  @Public()
  @Get('detail/:id')
  getBlogDetail(@Param('id') id: string) {
    return this.blogService.getBlogDetail(+id);
  }

  /**
   * 点赞功能（公开接口，无需JWT认证）
   */
  @Public()
  @Post('like/:id')
  likeArticle(@Param('id') id: string) {
    return this.blogService.likeArticle(+id);
  }
}

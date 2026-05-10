import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Article } from '../article/entities/article.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  /**
   * 获取博客列表（公开接口）
   */
  async getBlogList(query?: any): Promise<{ data: Article[]; total: number }> {
    const { page = 1, pageSize = 10, category, title } = query || {};
    const skip = (page - 1) * pageSize;

    const where: any = {};

    // 添加分类筛选
    if (category) {
      where.category = category;
    }

    // 添加标题模糊搜索
    if (title) {
      where.title = Like(`%${title}%`);
    }

    const [data, total] = await this.articleRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  /**
   * 获取博客详情（公开接口）
   */
  async getBlogDetail(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  /**
   * 点赞功能（公开接口）
   */
  async likeArticle(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // 点赞数 +1
    article.likes = (article.likes || 0) + 1;
    return await this.articleRepository.save(article);
  }
}

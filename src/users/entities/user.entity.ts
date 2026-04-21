// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  nickname: string; // 新增：昵称

  @Column()
  password: string;

  // 建议加上这个，记录创建时间
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
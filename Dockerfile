# 阶段 1: 构建阶段
FROM docker.io/library/node:20-alpine AS builder

WORKDIR /app

# 配置 npm 使用国内镜像源
RUN npm config set registry https://registry.npmmirror.com

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，因为需要编译 TypeScript）
RUN npm install

# 复制源代码
COPY . .

# 执行构建命令
RUN npm run build

# 阶段 2: 生产运行阶段
FROM docker.io/library/node:20-alpine AS production

WORKDIR /app

# 配置 npm 使用国内镜像源
RUN npm config set registry https://registry.npmmirror.com

# 只复制 package 文件并安装生产依赖
COPY package*.json ./
RUN npm install --only=production

# 从构建阶段复制编译好的 dist 目录
COPY --from=builder /app/dist ./dist

# 暴露 NestJS 默认端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/main.js"]
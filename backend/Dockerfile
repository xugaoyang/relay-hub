# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist

# data 目录由 docker-compose bind mount 注入；这里先建好以便首次启动也能写入
RUN mkdir -p /app/data/backups

EXPOSE 3001
CMD ["node", "dist/index.js"]

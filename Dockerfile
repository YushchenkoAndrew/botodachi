# Builder
FROM node:17-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --production


# Runner
FROM node:17-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 -S nestjs
RUN adduser -S nestjs -u 1001

COPY --from=builder --chown=nestjs:nestjs /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/

USER nestjs
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "dist/src/main"]

FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && PNPM_IGNORE_ENGINES=true pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-alpine AS production
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
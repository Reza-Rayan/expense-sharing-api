FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@11.13.0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build


FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm@11.13.0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 5050

CMD ["node", "dist/main.js"]
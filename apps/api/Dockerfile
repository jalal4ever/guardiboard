FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY packages/*/package.json ./packages/
COPY apps/api/package.json ./apps/api/

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

COPY . .

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["pnpm", "dev"]

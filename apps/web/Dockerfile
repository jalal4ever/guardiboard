FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY packages/*/package.json ./packages/
COPY apps/web/package.json ./apps/web/

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

COPY apps/web ./apps/web
COPY apps/web/next.config.js ./
COPY apps/web/next-env.d.ts ./
COPY apps/web/tsconfig.json ./
COPY apps/web/postcss.config.js ./
COPY apps/web/tailwind.config.ts ./

WORKDIR /app/apps/web

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]

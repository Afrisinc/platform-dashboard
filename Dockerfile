# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

RUN pnpm build

# ---------- Serve SPA with Nginx ----------
FROM nginx:alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 8017

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

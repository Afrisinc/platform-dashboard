# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:8091
ARG VITE_NOTIFY_URL=""
ARG VITE_NOTIFY_APP_ID=""
ARG VITE_GA_MEASUREMENT_ID=""
ARG VITE_GA_DEBUG=false
ARG VITE_FB_APP_ID=""

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the Vite client app
RUN VITE_API_URL=${VITE_API_URL} \
    VITE_NOTIFY_URL=${VITE_NOTIFY_URL} \
    VITE_NOTIFY_APP_ID=${VITE_NOTIFY_APP_ID} \
    VITE_GA_MEASUREMENT_ID=${VITE_GA_MEASUREMENT_ID} \
    VITE_GA_DEBUG=${VITE_GA_DEBUG} \
    VITE_FB_APP_ID=${VITE_FB_APP_ID} \
    pnpm build

# ---------- Serve SPA with Nginx ----------
FROM nginx:alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built client assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verify files were copied
RUN ls -la /usr/share/nginx/html/ || echo "Warning: dist folder appears empty"

ENV PORT=8017

EXPOSE 8017

CMD ["nginx", "-g", "daemon off;"]

# ─────────────────────────────────────────────
# Stage 1: Build React + Vite application
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package.json package-lock.json ./

# Install deps (clean install for reproducible builds)
RUN npm ci

# Copy entire source
COPY . .

# Inject build-time environment variables via build args
ARG VITE_API_DEPLOY_URL
ARG VITE_MAPBOX_TOKEN

ENV VITE_API_DEPLOY_URL=${VITE_API_DEPLOY_URL}
ENV VITE_MAPBOX_TOKEN=${VITE_MAPBOX_TOKEN}

# Increase Node heap memory limit to use Swap space during build
ENV NODE_OPTIONS="--max-old-space-size=1536"

# Build production bundle
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve with Nginx (Alpine – minimal)
# ─────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

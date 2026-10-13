# ==============================================================================
# KisanMitra AI — Frontend Multi-Stage Dockerfile (React 19 / Vite / Nginx)
# ==============================================================================

# Stage 1: Build client bundles using Node 20 LTS
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (utilize layer caching)
COPY package*.json ./
RUN npm install

# Build arguments for configurable API endpoint routing
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy source code and build production distribution
COPY . .
RUN npm run build

# Stage 2: Serve optimized static assets with hardened Nginx reverse proxy
FROM nginx:1.27-alpine

# Remove default Nginx welcome page and apply KisanMitra AI configuration
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production distribution from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck probe for Nginx web server
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -q -O - http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

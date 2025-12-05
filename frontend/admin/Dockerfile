# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy shared package first
COPY shared/package*.json ./shared/
WORKDIR /app/shared
RUN npm ci

# Copy admin frontend package
WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm ci

# Copy shared source
WORKDIR /app
COPY shared ./shared

# Copy admin source and build
COPY admin ./admin
WORKDIR /app/admin
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/admin/dist /usr/share/nginx/html

# Copy nginx configuration
COPY admin/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

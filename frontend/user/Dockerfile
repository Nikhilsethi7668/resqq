# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy shared directory
COPY shared ./shared
WORKDIR /app/shared
RUN npm install

# Copy user frontend
WORKDIR /app/user
COPY user/package*.json ./
RUN npm install

# Copy user source and build
COPY user ./user
WORKDIR /app/user
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/user/dist /usr/share/nginx/html

# Copy nginx configuration
COPY user/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

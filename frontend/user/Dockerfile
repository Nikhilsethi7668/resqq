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
COPY user .
WORKDIR /app/user
# Build arguments
ARG VITE_API_URL
ARG VITE_SOCKET_URL

# Set environment variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the application
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/user/dist ./dist

# Expose port
EXPOSE 80

# Start serve for SPA
CMD ["serve", "-s", "dist", "-l", "80"]

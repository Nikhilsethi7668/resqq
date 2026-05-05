# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy shared directory
COPY shared ./shared
WORKDIR /app/shared
RUN npm install

# Copy admin frontend
WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm install

# Copy admin source and build
COPY admin .
WORKDIR /app/admin
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
COPY --from=builder /app/admin/dist ./dist

# Expose port
EXPOSE 80

# Start serve for SPA
CMD ["serve", "-s", "dist", "-l", "80"]

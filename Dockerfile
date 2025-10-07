# Multi-stage Dockerfile for Home Healthcare Management System
# King Abdullah Hospital - Bisha

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install additional packages for Arabic support
RUN apk add --no-cache \
    fontconfig \
    ttf-dejavu \
    ttf-liberation

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (if available)
COPY ssl/ /etc/nginx/ssl/

# Create healthcare user for security
RUN addgroup -g 1001 -S healthcare && \
    adduser -S healthcare -u 1001

# Set proper permissions
RUN chown -R healthcare:healthcare /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Labels for container metadata
LABEL maintainer="KAH IT Department <it@kah-bisha.moh.gov.sa>"
LABEL description="Home Healthcare Management System - King Abdullah Hospital Bisha"
LABEL version="3.0.0"
LABEL vendor="Ministry of Health - Saudi Arabia"
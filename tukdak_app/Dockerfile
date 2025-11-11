# Multi-stage build for React + Vite application

# Stage 1: Build the application
FROM --platform=linux/amd64 node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Debug: Show what was built
RUN echo "=== Contents of /app/dist ===" && ls -la /app/dist/

# Stage 2: Production server with Nginx
FROM --platform=linux/amd64 nginx:alpine

# Remove ALL default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Debug: Show what was copied
RUN echo "=== Contents of /usr/share/nginx/html ===" && ls -la /usr/share/nginx/html/

# Expose port 3001
EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
# ── Stage 1: Build the React Application ─────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the app (Vite usually outputs to a 'dist' folder)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy the built assets from the builder stage
# Note: If your build outputs to 'build' instead of 'dist', change the path below
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
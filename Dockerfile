# --- Stage 1: Builder ---
FROM node:16.16.0 AS builder

WORKDIR /app

# Copy source code
COPY . .

# Install Angular CLI and dependencies
RUN npm install -g @angular/cli@11.2.19 && \
    yarn install --ignore-scripts && \
    ng build --prod --localize

# --- Stage 2: Runtime (lightweight) ---
FROM node:16.16.0-alpine

WORKDIR /app

# Copy only the built files from builder stage
COPY --from=builder /app/dist/www /app/www

# Add static assets
COPY assets/iGOT/client-assets/dist /app/www/en/assets
COPY assets/iGOT/client-assets/dist /app/www/hi/assets

# Install a lightweight HTTP server
RUN yarn global add serve

EXPOSE 3004

# Serve the English version by default
CMD ["serve", "-s", "www/en", "-l", "3004"]

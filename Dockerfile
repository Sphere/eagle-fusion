# --- Stage 1: Builder ---
FROM node:16.16.0 AS builder

WORKDIR /app
COPY . .

RUN npm install -g @angular/cli@11.2.19 && \
    yarn install --ignore-scripts && \
    ng build --prod --aot --build-optimizer --optimization \
      --source-map=false --output-hashing=all \
      --stats-json --output-path=dist/www/en \
      --base-href=/ --i18n-locale=en && \
    ng build --prod --aot --build-optimizer --optimization \
      --source-map=false --output-hashing=all \
      --output-path=dist/www/hi \
      --base-href=/hi/ --i18n-locale=hi \
      --i18n-format=xlf --i18n-file=locale/messages.hi.xlf && \
    npm run compress:brotli

# --- Stage 2: Runtime Image ---
FROM node:16.16.0-alpine AS runtime

WORKDIR /app

# Only copy compiled output
COPY --from=builder /app/dist /app/www
COPY assets/iGOT/client-assets/dist /app/www/en/assets
COPY assets/iGOT/client-assets/dist /app/www/hi/assets

# Install only production deps
COPY package.json yarn.lock ./
RUN yarn install --production --ignore-scripts

# Install serve (or use nginx alternatively)
RUN yarn global add serve

EXPOSE 3004
CMD ["serve", "-s", "www/en", "-l", "3004"]

# ---- Stage 1: Build Angular App ----
FROM node:16.16.0 AS builder

WORKDIR /app

# Only copy dependency files first (to leverage layer caching)
COPY package.json yarn.lock ./
RUN yarn install --ignore-scripts

# Copy rest of the source code
COPY . .

# Install Angular CLI
RUN npm install -g @angular/cli@11.2.19

# Build for English and Hindi locales
RUN ng build --prod --stats-json --output-path=dist/www/en --base-href=/ --i18n-locale=en --verbose=true && \
    ng build --prod \
    --i18n-locale=hi \
    --i18n-format=xlf \
    --i18n-file=locale/messages.hi.xlf \
    --output-path=dist/www/hi \
    --base-href=/hi/ && \
    npm run compress:brotli

# ---- Stage 2: Serve Built Files with Minimal Runtime ----
FROM node:16.16.0-alpine

WORKDIR /app

# Copy only the built dist folder from builder
COPY --from=builder /app/dist ./dist
COPY assets/iGOT/client-assets/dist ./dist/www/en/assets
COPY assets/iGOT/client-assets/dist ./dist/www/hi/assets

# Copy only production dependencies (if needed for runtime)
COPY package.json yarn.lock ./
RUN yarn install --production --ignore-scripts

EXPOSE 3004

CMD ["npm", "run", "serve:prod"]

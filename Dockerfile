FROM node:16.16.0

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install Angular CLI
RUN npm install -g @angular/cli@11.2.19

# Install dependencies
RUN yarn && yarn add moment vis-util

# Build English locale
RUN ng build --prod \
    --i18n-locale en \
    --output-path dist/www/en \
    --base-href / \
    --verbose

# Build Hindi locale
RUN ng build --prod \
    --i18n-locale hi \
    --i18n-format xlf \
    --i18n-file locale/messages.hi.xlf \
    --output-path dist/www/hi \
    --base-href /hi/ \
    --verbose

# Compress built files with Brotli (if script exists in package.json)
RUN npm run compress:brotli || echo "Skipping Brotli compression"

# Copy static assets
RUN mkdir -p www/en/assets && mkdir -p www/hi/assets
COPY assets/iGOT/client-assets/dist www/en/assets
COPY assets/iGOT/client-assets/dist www/hi/assets

# Install production-only dependencies (skip peer conflicts)
RUN npm install --production --legacy-peer-deps

# Expose application port
EXPOSE 3004

# Run production server
CMD ["npm", "run", "serve:prod"]

# Stage 1: Build Stage
FROM node:16.16.0 AS builder

WORKDIR /app

# Install Angular CLI
RUN npm install -g @angular/cli@8.3.27

# Copy package.json and yarn.lock first to utilize Docker cache if they don't change
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy all project files
COPY . .

# Run production build for both locales
RUN ng build --prod --output-path=dist/www/en --base-href=/ --i18n-locale=en \
&& ng build --prod --i18n-locale=hi --i18n-format=xlf --i18n-file=locale/messages.hi.xlf --output-path=dist/www/hi --base-href=/hi/

# Optional: Compress files using Brotli
RUN npm run compress:brotli

# Stage 2: Serve Stage
FROM node:16.16.0

WORKDIR /app

# Copy built files from the previous stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/assets/iGOT/client-assets/dist /app/dist/www/en/assets
COPY --from=builder /app/assets/iGOT/client-assets/dist /app/dist/www/hi/assets

# Install only production dependencies
RUN yarn install --production

# Expose the port
EXPOSE 3004

# Serve the application
CMD ["npm", "run", "serve:prod"]
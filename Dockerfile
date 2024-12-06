FROM node:12.22.12

WORKDIR /app
COPY . .

# Install dependencies
RUN yarn install --frozen-lockfile

# Add required dependencies explicitly
RUN yarn add moment vis-util

# Build Angular application
RUN node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --prod --build-optimizer --verbose
RUN ng build --prod --stats-json --outputPath=dist/www/en --baseHref=/ --i18nLocale=en
RUN ng build --prod --i18n-locale hi --i18n-format xlf --i18n-file locale/messages.hi.xlf --output-path=dist/www/hi --baseHref=/hi/

# Compress built assets
RUN npm run compress:brotli

# Copy assets
WORKDIR /app/dist
COPY assets/iGOT/client-assets/dist www/en/assets
COPY assets/iGOT/client-assets/dist www/hi/assets

# Install production dependencies
RUN npm install --production

# Expose port
EXPOSE 3004

# Run application
CMD ["npm", "run", "serve:prod"]

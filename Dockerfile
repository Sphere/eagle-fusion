FROM node:16.16.0

WORKDIR /app

# Copy package.json and package-lock.json first (or yarn.lock) to cache npm/yarn install
COPY package.json yarn.lock ./

# Install dependencies
RUN npm install -g @angular/cli@8.3.27
RUN yarn install

# Now copy the application files (this layer will only be invalidated if source code changes)
COPY . .

# Install additional dependencies, build, and compress
RUN yarn add moment && yarn add vis-util
RUN npm run build --prod --build-optimizer
RUN ng build --prod --stats-json --outputPath=dist/www/en --baseHref=/ --i18nLocale=en --verbose=true
RUN ng build --prod --i18n-locale hi --i18n-format xlf --i18n-file locale/messages.hi.xlf --output-path=dist/www/hi --baseHref /hi/
RUN npm run compress:brotli

# Prepare the assets and move them
WORKDIR /app/dist
COPY assets/iGOT/client-assets/dist www/en/assets
COPY assets/iGOT/client-assets/dist www/hi/assets
RUN npm install --production

# Expose the port and start the application
EXPOSE 3004
CMD [ "npm", "run", "serve:prod" ]

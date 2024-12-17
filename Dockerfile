FROM node:16.16.0

# Set the working directory in the container
WORKDIR /app

# Copy all files into the working directory
COPY . .

# Install Angular CLI globally with a specific version
RUN npm install -g @angular/cli@11.2.19

# Install project dependencies (using yarn instead of npm to keep the build consistent)
RUN yarn install

# Install specific packages (moment and vis-util)
RUN yarn add moment vis-util

# Build the project for production
RUN ng build --prod --stats-json --output-path=dist/www/en --base-href=/ --i18n-locale=en --verbose=true

# Build for Hindi locale
RUN ng build --prod --i18n-locale=hi --i18n-format=xlf --i18n-file=locale/messages.hi.xlf --output-path=dist/www/hi --base-href=/hi/

# Run the compression script (make sure it exists in your package.json)
RUN npm run compress:brotli
# Uncomment if you need gzip compression
# RUN npm run compress:gzip

# Change working directory to the dist folder where the build output resides
WORKDIR /app/dist

# Copy client assets into the build output directories
COPY assets/iGOT/client-assets/dist www/en/assets
COPY assets/iGOT/client-assets/dist www/hi/assets

# Install production dependencies in the dist folder (for server-side execution)
RUN npm install --production

# Expose port for the app
EXPOSE 3004

# Run the application (make sure 'serve:prod' exists in your package.json)
CMD ["npm", "run", "serve:prod"]

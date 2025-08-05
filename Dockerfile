# Use Node 16, compatible with Angular 12
FROM node:18.20.8

# Set the working directory in the container
WORKDIR /app

# Copy all files into the working directory
COPY . .

# Install Angular CLI globally with a specific version
RUN npm install -g @angular/cli@12.2.18

# Install project dependencies (using yarn instead of npm to keep the build consistent)
RUN yarn install

# Install specific packages (moment and vis-util)
RUN yarn add moment vis-util

# Ensure @angular/localize is installed for i18n support
RUN yarn add @angular/localize

# Build the project for production
RUN ng build --configuration production --stats-json --output-path=dist/www/en --base-href=/ --localize

# Build for Hindi locale
RUN ng build --configuration production --output-path=dist/www/hi --base-href=/hi/ --localize

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
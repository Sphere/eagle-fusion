# Use Node 16, compatible with Angular 12
FROM node:16.16.0

# Set the working directory in the container
WORKDIR /app

# Copy all files into the working directory
COPY . .

# Install Angular CLI globally with a specific version
RUN npm install -g @angular/cli@12.2.18

# Ensure @angular/localize is installed for i18n support
RUN yarn add @angular/localize@12.2.17

# Install project dependencies (using yarn instead of npm to keep the build consistent)
RUN yarn install

# Install specific packages (moment and vis-util)
RUN yarn add moment vis-util

# Build the project for production
RUN ng build --configuration production --output-path=dist/www/en --base-href=/en/ --localize=false

# Build for Hindi locale
RUN ng build --configuration production --output-path=dist/www/hi --base-href=/hi/ --localize=false

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

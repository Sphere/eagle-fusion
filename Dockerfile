# Use Node 16, compatible with Angular 12
FROM node:18.20.8

# Set the working directory in the container
WORKDIR /app

# Copy all files into the working directory
COPY . .

# Install Angular CLI globally with a specific version
RUN npm install -g @angular/cli@16.2.16

# Ensure @angular/localize is installed for i18n support
RUN yarn add @angular/localize@16.2.12

# Install project dependencies (using yarn)
RUN yarn install

# Install specific packages (moment and vis-util)
RUN yarn add moment vis-util

# Build the project for production
RUN ng build --configuration production --output-path=dist/www --base-href=/ --localize=false

# Run the compression script (make sure it exists in your package.json)
RUN yarn run compress:brotli
# Uncomment if you need gzip compression
# RUN yarn run compress:gzip

# Change working directory to the dist folder where the build output resides
WORKDIR /app/dist

# Copy client assets into the build output directory
COPY assets/iGOT/client-assets/dist www/assets

# Install production dependencies in the dist folder (for server-side execution)
RUN yarn install --production
# Expose port for the app
EXPOSE 3004

# Run the application (make sure 'serve:prod' exists in your package.json)
CMD ["yarn", "run", "serve:prod"]

# Use Node 16, compatible with Angular 12
FROM node:18.20.8

# Set the working directory in the container
WORKDIR /app

# Copy all files into the working directory
COPY . .

# Install Angular CLI and http-server globally with a specific version
RUN npm install -g @angular/cli@16.2.16 http-server

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
EXPOSE 3002

# Run the application on port 3002 to match Kubernetes service configuration
# www: serve the www directory, -p: port, -c-1: disable caching, --spa: fallback to index.html
CMD ["http-server", "www", "-p", "3002", "-c-1", "--spa"]

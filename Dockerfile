# Use Node 20.19+ required for Angular 21
FROM node:20.19.0

# Build argument for cache busting
ARG BUILDKIT_INLINE_CACHE=1

# Set the working directory in the container
WORKDIR /app

# Copy all files into the working directory
COPY . .

# Install Angular CLI and http-server globally with a specific version
RUN npm install -g @angular/cli@21 http-server

# Ensure @angular/localize is installed for i18n support
RUN yarn add @angular/localize@21

# Install project dependencies (using yarn)
RUN yarn install

# Install specific packages (moment and vis-util)
RUN yarn add moment vis-util

# Production browser build
RUN yarn build

# Compress output
RUN yarn run compress:brotli

# Change working directory to the app root
WORKDIR /app

# Copy the server script
COPY server.js ./

# Note: express and compression should already be in node_modules from yarn install above
# If they're not in package.json, uncomment the line below:
# RUN npm install express compression

# Build output is at dist/www
# Note: assets/iGOT/client-assets/dist will only be copied if it exists
# COPY assets/iGOT/client-assets/dist dist/www/assets || true

# Expose port for the app
EXPOSE 3002

# Run the Node.js server that properly handles SPA routing
CMD ["node", "server.js"]

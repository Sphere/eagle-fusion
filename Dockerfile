FROM node:16.16.0

# Set the working directory in the container
WORKDIR /app

# Copy all files into the working directory
COPY . .

# Install Angular CLI globally, install dependencies, add required packages, and run the production builds
# Install Angular CLI globally, install dependencies, add required packages, and run the production builds
RUN npm install -g @angular/cli@15.2.10 && \
    yarn install --ignore-scripts && \
    yarn add moment vis-util && \
    ng build --configuration production --stats-json \
        --output-path=dist/www/en \
        --base-href=/ \
        --verbose=true && \
    ng build --configuration production \
        --localize=hi \
        --i18n-format=xlf \
        --i18n-file=locale/messages.hi.xlf \
        --output-path=dist/www/hi \
        --base-href=/hi/ && \
    npm run compress:brotli

# Change working directory to the dist folder where the build output resides
WORKDIR /app/dist

# Copy client assets into the build output directories
COPY assets/iGOT/client-assets/dist www/en/assets
COPY assets/iGOT/client-assets/dist www/hi/assets

# Install only production dependencies
RUN npm install --production

# Expose port for the application
EXPOSE 3004

# Start the application
CMD ["npm", "run", "serve:prod"]

FROM node:16.16.0

# Set the working directory in the container
WORKDIR /app

# Copy all files into the working directory
COPY . .

# Install Angular CLI globally, install dependencies, add required packages, and run the production build
RUN npm install -g @angular/cli@11.2.19 && \
    yarn install --ignore-scripts && \
    yarn add moment vis-util && \
    ng build --prod --stats-json --output-path=dist/www/en --base-href=/ --i18n-locale=en --verbose=true && \
    ng build --prod --i18n-locale=hi --i18n-format=xlf --i18n-file=locale/messages.hi.xlf --output-path=dist/www/hi --base-href=/hi/ && \
    npm run compress:brotli  # <--- Fix: Ensure its part of the `RUN` command

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

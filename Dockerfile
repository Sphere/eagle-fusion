# Use a Node.js 18 LTS base image
FROM node:18.20.2

# Set the working directory in the container
WORKDIR /app

# Copy package files first for better caching
COPY package*.json yarn.lock ./

# Install Angular CLI globally and update browserslist database
RUN npm install -g @angular/cli@15.2.10 && \
    npx browserslist@latest --update-db

# Install dependencies (moment and vis-util are already in package.json)
# Also install stylelint since it's required by the prebuild script
RUN yarn install --ignore-scripts && \
    yarn add -D stylelint stylelint-config-standard-scss stylelint-scss

# Copy all files into the working directory
COPY . .

# Create stylelint config file to avoid errors
RUN echo '{ "extends": ["stylelint-config-standard-scss"] }' > .stylelintrc.json

# Run the production builds using your npm scripts (this will trigger prebuild/lint:scss)
RUN npm run build -- --stats-json --output-path=dist/www/en --base-href=/ --verbose=true && \
    npm run build:hi -- --output-path=dist/www/hi --base-href=/hi/ && \
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
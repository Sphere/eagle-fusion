# Use a Node.js 18 LTS base image
FROM node:18.20.2

WORKDIR /app

# Copy package files first for better caching
COPY package*.json yarn.lock ./

# Install Angular CLI globally and update browserslist database
RUN npm install -g @angular/cli@15.2.10 && \
    npx browserslist@latest --update-db

# Install dependencies and compatible linter versions
RUN yarn install --ignore-scripts && \
    yarn add -D stylelint@14.16.0 stylelint-config-standard-scss@6.0.0 stylelint-scss@4.5.0

# Copy all files into the working directory
COPY . .

# Create stylelint config file
RUN echo '{ "extends": ["stylelint-config-standard-scss"] }' > .stylelintrc.json

# Run production builds
RUN npm run build:stats && \
    npm run build:hi && \
    npm run compress:brotli

WORKDIR /app/dist

COPY assets/iGOT/client-assets/dist www/en/assets
COPY assets/iGOT/client-assets/dist www/hi/assets

RUN npm install --production

EXPOSE 3004

CMD ["npm", "run", "serve:prod"]

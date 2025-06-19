# --- Stage 1: Builder ---
FROM node:16.16.0 AS BUILDER

WORKDIR /app

COPY . .

RUN npm install -g @angular/cli@11.2.19 && \
    yarn install --ignore-scripts && \
    ng build --prod \
      --output-path=dist/www/en \
      --base-href=/ \
      --i18n-locale=en && \
    ng build --prod \
      --output-path=dist/www/hi \
      --base-href=/hi/ \
      --i18n-locale=hi \
      --i18n-format=xlf \
      --i18n-file=locale/messages.hi.xlf

# --- Stage 2: Runtime Image ---
FROM node:16.16.0-alpine AS RUNTIME

WORKDIR /app

COPY --from=BUILDER /app/dist/www /app/www

COPY assets/iGOT/client-assets/dist /app/www/en/assets
COPY assets/iGOT/client-assets/dist /app/www/hi/assets

RUN yarn global add serve

EXPOSE 3004

CMD ["serve", "-s", "www/en", "-l", "3004"]

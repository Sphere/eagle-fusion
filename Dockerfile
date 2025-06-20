# --- Stage 1: Angular Build ---
FROM node:16.16.0 AS builder

WORKDIR /app
COPY . .

RUN npm install -g @angular/cli@11.2.19 && \
    yarn install --ignore-scripts && \
    ng build --prod --output-path=dist/www/en --base-href=/ --i18n-locale=en && \
    ng build --prod --output-path=dist/www/hi --base-href=/hi/ --i18n-locale=hi \
      --i18n-format=xlf --i18n-file=locale/messages.hi.xlf

# --- Stage 2: Runtime (Nginx) ---
FROM nginx:1.21-alpine

# Copy builds to nginx html dir
COPY --from=builder /app/dist/www/en /usr/share/nginx/html
COPY --from=builder /app/dist/www/hi /usr/share/nginx/html/hi

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

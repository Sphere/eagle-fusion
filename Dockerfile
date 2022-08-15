FROM node:16.20.0

WORKDIR /app
COPY . .

#RUN npm i yarn
#RUN yarn global add @angular/cli@latest

RUN yarn && yarn add moment && yarn add vis-util && yarn add jspdf && yarn add lodash && npm run build --prod --build-optimizer && npm run build:hi --prod --build-optimizer
RUN ng build --prod --outputPath=dist/www/en --baseHref=/ --i18nLocale=en --verbose=true
RUN ng build --prod --i18n-locale hi --i18n-format xlf --i18n-file locale/messages.hi.xlf --output-path=dist/www/hi --baseHref /hi/
RUN npm run compress:brotli
#RUN npm run compress:gzip

WORKDIR /app/dist
COPY assets/iGOT/client-assets/dist www/en/assets
COPY assets/iGOT/client-assets/dist www/hi/assets
RUN npm install --production
EXPOSE 3004

CMD [ "npm", "run", "serve:prod" ]


#!/usr/bin/env node --max_old_space_size=8192
npm run i18n
ng build --prod --outputPath=dist/www/en --baseHref=/ --i18nLocale=en --verbose=true
langs=("ar zh-CN de es fr nl")
for lang in $langs
do
  ng build --prod --output-path=dist/www/$lang --baseHref=/ --i18nLocale=$lang --i18nFile=locale/messages.$lang.xlf --verbose=true
done
npm run compress:brotli
npm run compress:gzip

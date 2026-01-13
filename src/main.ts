import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { PerformanceService } from './app/services/performance.service'

import { environment } from './environments/environment'
import { AppModule } from './app/app.module'


if (environment.production) {
  enableProdMode()
}

const MATCHING_IE = navigator.userAgent.match(/(msie|trident(?=\/))\/?\s*(\d+)/i) || []
if (/trident/i.test(MATCHING_IE[1])) {
  document.body.innerHTML = '<h1 style="margin-top: 50px; text-align: center">IE 11 and lesser version browsers are not supported.</h1><h3 style="margin-top: 16px; text-align: center">For best experience, use Google Chrome</h3>'
} else {
  platformBrowserDynamic()
    .bootstrapModule(AppModule, {
      preserveWhitespaces: false,
    })
    .then(() => {
      // Performance optimization: preload critical resources
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const perfService = new PerformanceService()
          perfService.preloadCriticalResources()
          perfService.optimizeBundleLoading()
        })
      }
    })
    .catch(err => console.error(err))
}

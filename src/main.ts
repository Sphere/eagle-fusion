import { enableProdMode } from '@angular/core'
import { platformBrowser } from '@angular/platform-browser'
import { PerformanceService } from './app/services/performance.service'
import '@angular/compiler'

import { environment } from './environments/environment'
import { AppModule } from './app/app.module'


if (environment.production) {
  enableProdMode()
}

const MATCHING_IE = navigator.userAgent.match(/(msie|trident(?=\/))\/?\s*(\d+)/i) || []
if (/trident/i.test(MATCHING_IE[1])) {
  document.body.innerHTML = '<h1 style="margin-top: 50px; text-align: center">IE 11 and lesser version browsers are not supported.</h1><h3 style="margin-top: 16px; text-align: center">For best experience, use Google Chrome</h3>'
} else {
  platformBrowser()
    .bootstrapModule(AppModule)
    .then(moduleRef => {
      // Use Angular DI instead of `new`
      const injector = moduleRef.injector
      const perfService = injector.get(PerformanceService)

      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          perfService.preloadCriticalResources()
          perfService.optimizeBundleLoading()
        })
      }
    })
    .catch(err => console.error(err))
}

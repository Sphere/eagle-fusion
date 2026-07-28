import { AuthInitService } from './services/init.service'
import { LoaderService } from './services/loader.service'
import { NgModule } from '@angular/core'
import { CommonModule, APP_BASE_HREF, PlatformLocation } from '@angular/common'

import { WsAuthorRootRoutingModule } from './ws-auth-root-routing.module'
import { AuthRootComponent } from './components/root/root.component'
import { SharedModule } from './modules/shared/shared.module'
import { BtnPageBackModule } from '@ws-widget/collection'
import { ApiService } from './modules/shared/services/api.service'
import { WorkFlowService } from './services/work-flow.service'

/**
 * This function is used internal to get a string instance of the `<base href="" />` value from `index.html`.
 * This is an exported function, instead of a private function or inline lambda, to prevent this error:
 *
 * `Error encountered resolving symbol values statically.`
 * `Function calls are not supported.`
 * `Consider replacing the function or lambda with a reference to an exported function.`
 *
 * @param platformLocation an Angular service used to interact with a browser's URL
 * @returns {string} a string instance of the `<base href="" />` value from `index.html`
 */
export function getBaseHref(platformLocation: PlatformLocation): string {
  return platformLocation.getBaseHrefFromDOM()
}

@NgModule({
  declarations: [AuthRootComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    WsAuthorRootRoutingModule,
    BtnPageBackModule,
  ],
  providers: [
    AuthInitService,
    ApiService,
    LoaderService,
    WorkFlowService,
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [PlatformLocation],
    },
  ],
})
export class WsAuthorRootModule { }

import { ZipJSResolverService } from './services/zip-js-resolve.service'
import { NotificationService } from './../../../app/src/lib/routes/notification-v2/services/notification.service'
import { AuthInitService } from './services/init.service'
import { ContentAndDataReadMultiLangTOCResolver } from './services/content-and-data-read-multi-lang.service'
import { InitResolver } from './services/init-resolve.service'
import { LoaderService } from './services/loader.service'
import { HomeModule } from '@ws/author/src/lib/routing/modules/home/home.module'
import { NgModule, ErrorHandler } from '@angular/core'
import { CommonModule, APP_BASE_HREF, PlatformLocation } from '@angular/common'

import { WsAuthorRootRoutingModule } from './ws-auth-root-routing.module'
import { AuthRootComponent } from './components/root/root.component'
import { SharedModule } from './modules/shared/shared.module'
import { AuthNavigationComponent } from './components/auth-navigation/auth-navigation.component'
import { ContentTOCResolver } from './services/content-resolve.service'
import { TocComponent } from './routing/components/toc/toc.component'
import { CreateModule } from './routing/modules/create/create.module'
import { AuthoringErrorHandler } from './services/error-handler.service'
import { ViewerComponent } from './routing/components/viewer/viewer.component'
import { PipeSafeSanitizerModule } from '@ws-widget/utils/src/public-api'
import { BtnPageBackModule } from '@ws-widget/collection'
import { ApiService } from './modules/shared/services/api.service'
import { CKEditorResolverService } from './services/ckeditor-resolve.service'
import { AuthNavBarToggleService } from './services/auth-nav-bar-toggle.service'
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
  declarations: [AuthRootComponent, AuthNavigationComponent, TocComponent, ViewerComponent],
  imports: [
    CommonModule,
    SharedModule,
    CreateModule,
    HomeModule,
    WsAuthorRootRoutingModule,
    PipeSafeSanitizerModule,
    BtnPageBackModule,
  ],
  providers: [
    AuthInitService,
    CKEditorResolverService,
    ZipJSResolverService,
    ContentTOCResolver,
    ApiService,
    ContentAndDataReadMultiLangTOCResolver,
    LoaderService,
    InitResolver,
    NotificationService,
    WorkFlowService,
    { provide: ErrorHandler, useClass: AuthoringErrorHandler },
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [PlatformLocation],
    },
    AuthNavBarToggleService,
  ],
})
export class WsAuthorRootModule {}

import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay'
import { APP_BASE_HREF, PlatformLocation } from '@angular/common'
import { HttpClientJsonpModule, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { APP_INITIALIZER, Injectable, NgModule, ErrorHandler } from '@angular/core'
import {
  GestureConfig,
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatMenuModule,
  MatProgressBarModule,
  MatGridListModule,
  MatRippleModule,
  MatSliderModule,
  MatToolbarModule,
  MatTooltipModule,
  MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatInputModule,
  MatFormFieldModule,
  MatListModule,
  MatAutocompleteModule,
} from '@angular/material'
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BtnFeatureModule, ErrorResolverModule, TourModule, WIDGET_REGISTERED_MODULES, WIDGET_REGISTRATION_CONFIG, PipeContentRoutePipe } from '@ws-widget/collection'
import { StickyHeaderModule } from '@ws-widget/collection/src/lib/_common/sticky-header/sticky-header.module'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { LoggerService, PipeSafeSanitizerModule } from '@ws-widget/utils'
import { SearchModule } from '@ws/app/src/public-api'
import 'hammerjs'
import { KeycloakAngularModule } from 'keycloak-angular'
import { AppRoutingModule } from './app-routing.module'
import { InitService } from './services/init.service'
import { GlobalErrorHandlingService } from './services/global-error-handling.service'
import { AppTocResolverService } from '@ws/app/src/lib/routes/app-toc/resolvers/app-toc-resolver.service'

import { RootComponent } from './component/root/root.component'
import { LoginComponent } from './component/login/login.component'
import { AppFooterComponent } from './component/app-footer/app-footer.component'
import { AppNavBarComponent } from './component/app-nav-bar/app-nav-bar.component'
import { AppPublicNavBarComponent } from './component/app-public-nav-bar/app-public-nav-bar.component'
// import { ServiceWorkerModule } from '@angular/service-worker'
// import { environment } from '../environments/environment'
import { DialogConfirmComponent } from './component/dialog-confirm/dialog-confirm.component'
import { InvalidUserComponent } from './component/invalid-user/invalid-user.component'
import { LoginRootComponent } from './component/login-root/login-root.component'
import { LoginRootDirective } from './component/login-root/login-root.directive'
import { TncRendererComponent } from './component/tnc-renderer/tnc-renderer.component'
import { MobileAppModule } from './routes/public/mobile-app/mobile-app.module'
import { PublicAboutModule } from './routes/public/public-about/public-about.module'
import { PublicHomeModule } from './routes/public/public-home/public-home.module'
import { PublicContactModule } from './routes/public/public-contact/public-contact.module'
import { PublicFaqModule } from './routes/public/public-faq/public-faq.module'
import { TncComponent } from './routes/tnc/tnc.component'
import { RegisterComponent } from './routes/register/register.component'
import { ForgotPasswordComponent } from './routes/forgot-password/forgot-password.component'

import { AppInterceptorService } from './services/app-interceptor.service'
import { AppRetryInterceptorService } from './services/app-retry-interceptor.service'
import { TncAppResolverService } from './services/tnc-app-resolver.service'
import { TncPublicResolverService } from './services/tnc-public-resolver.service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SlidersModule } from './../../library/ws-widget/collection/src/lib/sliders/sliders.module'
import { OrgComponent } from '../../project/ws/app/src/lib/routes/org/components/org/org.component'
import { MdePopoverModule } from '@material-extended/mde'
import { MobileLoginComponent } from './routes/mobile-login/mobile-login.component'
import { LoginOtpComponent } from './routes/login-otp/login-otp.component'
import { CreateAccountComponent } from './routes/create-account/create-account.component'
import { YourLocationComponent } from './routes/your-location/your-location.component'
// import { ServiceWorkerModule } from '@angular/service-worker'
// import { environment } from '../environments/environment'

@Injectable()
export class HammerConfig extends GestureConfig {
  buildHammer(element: HTMLElement) {
    return new GestureConfig({ touchAction: 'pan-y' }).buildHammer(element)
  }
}
const appInitializer = (initSvc: InitService, logger: LoggerService) => async () => {
  try {
    await initSvc.init()
  } catch (error) {
    logger.error('ERROR DURING APP INITIALIZATION >', error)
  }
}

const getBaseHref = (platformLocation: PlatformLocation): string => {
  return platformLocation.getBaseHrefFromDOM()
}

// tslint:disable-next-line: max-classes-per-file
@NgModule({
  declarations: [
    RootComponent,
    LoginComponent,
    AppNavBarComponent,
    AppPublicNavBarComponent,
    TncComponent,
    RegisterComponent,
    TncRendererComponent,
    AppFooterComponent,
    InvalidUserComponent,
    DialogConfirmComponent,
    LoginRootComponent,
    LoginRootDirective,
    ForgotPasswordComponent,
    OrgComponent,
    MobileLoginComponent,
    LoginOtpComponent,
    CreateAccountComponent,
    YourLocationComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserAnimationsModule,
    KeycloakAngularModule,
    AppRoutingModule,
    ...WIDGET_REGISTERED_MODULES,
    WidgetResolverModule.forRoot(WIDGET_REGISTRATION_CONFIG),
    StickyHeaderModule,
    ErrorResolverModule,
    // Material Imports
    MatSliderModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatGridListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatRippleModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    SearchModule,
    BtnFeatureModule,
    PublicAboutModule,
    PublicHomeModule,
    PublicContactModule,
    PublicFaqModule,
    MobileAppModule,
    PipeSafeSanitizerModule,
    TourModule,
    SlidersModule,
    MdePopoverModule,
    MatAutocompleteModule,
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  exports: [
    TncComponent, AppPublicNavBarComponent, RegisterComponent, ForgotPasswordComponent,
  ],
  bootstrap: [RootComponent],
  entryComponents: [
    DialogConfirmComponent,
    LoginComponent,
  ],
  providers: [
    {
      deps: [InitService, LoggerService],
      multi: true,
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 5000 },
    },
    {
      provide: MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS,
      useValue: {
        diameter: 55,
        strokeWidth: 4,
      },
    },
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AppRetryInterceptorService, multi: true },
    TncAppResolverService,
    TncPublicResolverService,
    PipeContentRoutePipe,
    AppTocResolverService,
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [PlatformLocation],
    },
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
    { provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig },
    { provide: ErrorHandler, useClass: GlobalErrorHandlingService },
  ],
})
export class AppModule { }

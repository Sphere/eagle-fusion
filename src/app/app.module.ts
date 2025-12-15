import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay'
import {
  APP_BASE_HREF, PlatformLocation, CommonModule,
} from '@angular/common'
import { HttpClientJsonpModule, HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { APP_INITIALIZER, Injectable, NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core'
import { SharedModule } from './shared/shared.module'
// import { GestureConfig } from '@angular/material/core/gestures/gesture-config'
// import * as Hammer from 'hammerjs'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core'
import { MatSliderModule } from '@angular/material/slider'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS } from '@angular/material/progress-spinner'
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatListModule } from '@angular/material/list'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatSelectModule } from '@angular/material/select'
import { MatChipsModule } from '@angular/material/chips'
import { MatTabsModule } from '@angular/material/tabs'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { BrowserModule, HAMMER_GESTURE_CONFIG, Title, HammerGestureConfig } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  ErrorResolverModule,
  // TourModule,
  WIDGET_REGISTERED_MODULES, WIDGET_REGISTRATION_CONFIG, PipeContentRoutePipe,
} from '@ws-widget/collection'
// import { StickyHeaderModule } from '@ws-widget/collection/src/lib/_common/sticky-header/sticky-header.module'
import { WidgetResolverModule } from '@ws-widget/resolver'
import {
  ImageCropModule,
  LoggerService,
} from '@ws-widget/utils'

import 'hammerjs'
import { KeycloakAngularModule } from 'keycloak-angular'
import { AppRoutingModule } from './app-routing.module'
import { InitService } from './services/init.service'
import { GlobalErrorHandlingService } from './services/global-error-handling.service'
import { AppTocResolverService } from '@ws/app/src/lib/routes/app-toc/resolvers/app-toc-resolver.service'

import { RootComponent } from './component/root/root.component'
// import { AppFooterComponent } from './component/app-footer/app-footer.component'
// import { AppNavBarComponent } from './component/app-nav-bar/app-nav-bar.component'
import { AppPublicNavBarComponent } from './component/app-public-nav-bar/app-public-nav-bar.component'
// import { ServiceWorkerModule } from '@angular/service-worker'
// import { environment } from '../environments/environment'
// import { DialogConfirmComponent } from './component/dialog-confirm/dialog-confirm.component'
import { InvalidUserComponent } from './component/invalid-user/invalid-user.component'
import { LoginRootComponent } from './component/login-root/login-root.component'
import { LoginRootDirective } from './component/login-root/login-root.directive'
// import { TncRendererComponent } from './component/tnc-renderer/tnc-renderer.component'
// import { MobileAppModule } from './routes/public/mobile-app/mobile-app.module'

import { TncComponent } from './routes/tnc/tnc.component'

import { AppInterceptorService } from './services/app-interceptor.service'
import { AppRetryInterceptorService } from './services/app-retry-interceptor.service'
import { TncAppResolverService } from './services/tnc-app-resolver.service'
import { TncPublicResolverService } from './services/tnc-public-resolver.service'
import { LanguageService } from './services/language.service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { OrgComponent } from '../../project/ws/app/src/lib/routes/org/components/org/org.component'
import { HeaderComponent } from './routes/header/header.component'
import { GoogleCallbackComponent } from './routes/google-callback/google-callback.component'
import { MobileDashboardComponent } from './routes/mobile-dashboard/mobile-dashboard.component'

import { OrgSelectiveCourseModule } from '../../project/ws/app/src/lib/routes/org/components/org-selective-course/org-selective-course.module'
// import { OrgSelectiveCourseComponent } from 'project/ws/app/src/lib/routes/org/components/org-selective-course/org-selective-course.component'
// import { MobileCategoryComponent } from './routes/mobile-category/mobile-category.component'
// import { MobileVideoPlayerComponent } from './routes/mobile-video-player/mobile-video-player.component'
// import { MobileFooterComponent } from './routes/mobile-footer/mobile-footer.component'
import { DiscussionUiModule } from '@aastrika_npmjs/discussions-ui-v8'
import { ConfigService } from './routes/discussion-forum/wrapper/service/config.service'
import { LoaderService } from '../../project/ws/author/src/public-api'
import { LanguageDialogComponent } from './routes/language-dialog/language-dialog.component'
import { CreateAccountDialogComponent } from './routes/create-account-modal/create-account-dialog.component'
// import { DropdownDobComponent } from 'src/app/component/dropdown-dob/dropdown-dob.component'
import { OrganisationsModule } from '../organisations/organisations.module'
import { WebPagesModule } from './routes/web-pages/web-pages.module'
import { LoginModule } from './routes/login/login.module'
import { ProfileViewModule } from './routes/profile-view/profile-view.module'
import { CoreModule } from './core/core.module'
import { CompetencyModule as AppCompetencyModule } from './routes/competency/competency.module'
import { Capacitor } from '@capacitor/core'
import { SashaktCallbackComponent } from './sashakt-callback/sashakt-callback.component'
// import { EntryModule } from '@aastrika_npmjs/competency-web/entry-module'
import { EntryModule } from '@aastrika_npmjs/comptency/entry-module'
import { SelfAssessmentModule } from '@aastrika_npmjs/comptency/self-assessment'
import { CompetencyModule } from '@aastrika_npmjs/comptency/competency'
import { COMPETENCY_REGISTRATION_CONFIG } from './routes/competency/competency.config'
import { AppCallBackComponent } from './component/app-call-back/app-call-back.component'
import { UserAgentResolverService } from './services/user-agent.service'
// import { WebEkshamataPublicComponent } from './routes/web-ekshamata-public-container/web-ekshamata-public-container.component'
import { PipeCountTransformModule, PipeDurationTransformModule, PipeHtmlTagRemovalModule, PipePartialContentModule } from '@ws-widget/utils'
import { HorizontalScrollerModule } from '@ws-widget/utils/src/public-api'
import { ScromPlayerComponent } from './routes/public/scrom-player/scrom-player.component'
// import { VideoPopupComponent } from './routes/how-does-it-works-popup/how-does-it-works-popup.component'
import { MaternityCallbackComponent } from './maternity-callback/maternity-callback.component'
// import { MyCoursesComponent } from './component/my-courses/my-courses.component'
import { CarouselComponentComponent } from '../app/routes/carousel-banner/carousel-component.component'
import { PublicLoginComponent } from './public-login/public-login.component'
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db'
import { TnaiCallbackComponent } from './tnai-callback/tnai-callback.component'
// import { BnrcmodalComponent } from './routes/bnrc-popup/bnrc-modal-component'
// import { SettingsComponent } from 'project/ws/app/src/lib/routes/profile/routes/settings/settings.component'
// import { NotificationsComponent } from './routes/notification/notification.component'
import { TnnmcCallbackComponent } from './tnnmc-callback/tnnmc-callback.component'
// import { TnnmcConfirmComponent } from './component/tnnmc-dialog-confirm/tnnmc-confirm.component'
import { TextFieldModule } from '@angular/cdk/text-field'

@Injectable()
export class HammerConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement) {
    const options: HammerOptions = {
      touchAction: 'pan-y',
      recognizers: [
        [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }],
      ],
    }
    const mc = new Hammer.Manager(element, options)
    return mc
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

// ngx-translate HttpLoaderFactory
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

if (Capacitor.getPlatform() === 'ios') {
  // tslint:disable-next-line:no-console
  console.log('iOS!')
} else if (Capacitor.getPlatform() === 'android') {
  // tslint:disable-next-line:no-console
  console.log('Android!')
} else {
  // tslint:disable-next-line:no-console
  console.log('Web!')
}

const url = window.location.href
// console.log(url)

if (url.indexOf('&code=') > 0) {
  const code = url.slice(url.indexOf('&code=') + 6)
  // localStorage.clear()
  sessionStorage.setItem('code', code)
}

// if (url.includes('token') && url.includes('moduleId')) {
//   const sashakt_token = url.slice(url.indexOf('?token=') + 7, url.indexOf('&moduleId='))
//   sessionStorage.setItem('sashakt_token', sashakt_token)
//   const sashakt_moduleId = url.slice(url.indexOf('&moduleId=') + 10)
//   sessionStorage.setItem('sashakt_moduleId', sashakt_moduleId)
// }

// Conditions added for checking if nhsrc organisation is present in url
if (url.indexOf('?org=') > 0 || url.indexOf('&org=')) {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const orgValue = urlParams.get('org')
  if (orgValue) {
    localStorage.setItem('orgValue', orgValue)
    if (orgValue === 'nhsrc') {
      if (url.indexOf('do_') > 0) {
        // window.location.href = `${url}`
        console.log('app.module', url)
        localStorage.setItem(`url_before_login`, `app/toc/` + `${url.split('/')[5]
          }` + `/overview`)
        // window.location.href = `${document.baseURI}organisations/home`
      } else {
        console.log('line number 182 else in app module.ts', url)
        window.location.href = `${document.baseURI}organisations/home`
      }
    }
  }
}

const dbConfig: DBConfig = {
  name: 'optimistic-ui-online-store',
  version: 1,
  objectStoresMeta: [
    {
      store: 'onlineCourseProgress',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'courseId', keypath: 'courseId', options: { unique: false } },
        { name: 'contentId', keypath: 'contentId', options: { unique: false } },
        { name: 'userId', keypath: 'userId', options: { unique: false } },
        // Add more properties as needed
      ]
    },
    {
      store: 'userEnrollCourse',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'courseId', keypath: 'courseId', options: { unique: false } },
        { name: 'contentId', keypath: 'contentId', options: { unique: false } },
        { name: 'userId', keypath: 'userId', options: { unique: false } },
        // Add more properties as needed
      ]
    }
  ]
}

// tslint:disable-next-line: max-classes-per-file
@NgModule({
  declarations: [
    RootComponent,
    TncComponent,
    InvalidUserComponent,
    LoginRootComponent,
    LoginRootDirective,
    // Login components now in LoginModule
    // RegisterComponent,
    // ForgotPasswordComponent,
    // MobileLoginComponent,
    // LoginOtpComponent,
    // BnrcLoginOtpComponent,
    // CreateAccountComponent,
    // YourLocationComponent,
    // NewTncComponent,
    // YourBackgroundComponent,
    // AlmostDoneComponent,
    // CompleteProfileComponent,
    OrgComponent,
    // OrgSelectiveCourseComponent,
    HeaderComponent,
    GoogleCallbackComponent,
    MobileDashboardComponent,
    // MobileCategoryComponent,
    // MobileVideoPlayerComponent,
    LanguageDialogComponent,
    CreateAccountDialogComponent,
    SashaktCallbackComponent,
    // SelfAssessmentComponent now in CompetencyModule
    // SelfAssessmentComponent,
    AppCallBackComponent,
    CarouselComponentComponent,
    PublicLoginComponent,
    TnaiCallbackComponent,
    // Web pages components are now in WebPagesModule
    // WebHowDoesWorkComponent,
    // WebFeaturedCourseComponent,
    // WebTrustedByPageComponent,
    // WebNavLinkPageComponent,
    // WebDashboardComponent,
    // WebPublicComponent,
    // WebCourseViewComponent,
    // WebCourseCardComponent,
    ScromPlayerComponent,
    MaternityCallbackComponent,
    TnnmcCallbackComponent,
  ],
  imports: [
    // 1) Browser + animations first
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,

    // 2) Http client BEFORE Translate.forRoot
    HttpClientModule,
    HttpClientJsonpModule,

    // 3) Forms and routing
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,

    // 4) Initialize ngx-translate AFTER HttpClientModule
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

    // 5) Shared module which exports TranslateModule
    SharedModule,
    OrgSelectiveCourseModule,

    // 6) Web pages module
    WebPagesModule,

    // 7) Login module with registration and auth components
    LoginModule,

    ProfileViewModule,
    CoreModule,

    // 8) Competency module
    AppCompetencyModule,

    // 9) Then other modules
    KeycloakAngularModule,
    ...WIDGET_REGISTERED_MODULES,
    WidgetResolverModule.forRoot(WIDGET_REGISTRATION_CONFIG),
    ErrorResolverModule,
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
    MatChipsModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DiscussionUiModule,
    ImageCropModule,
    OrganisationsModule,
    EntryModule.forRoot(COMPETENCY_REGISTRATION_CONFIG),
    SelfAssessmentModule,
    CompetencyModule.forRoot(COMPETENCY_REGISTRATION_CONFIG),
    PipeDurationTransformModule,
    PipePartialContentModule,
    PipeCountTransformModule,
    PipeHtmlTagRemovalModule,
    HorizontalScrollerModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    TextFieldModule
  ],
  exports: [
    TranslateModule,
    TncComponent,
    AppPublicNavBarComponent,
    MobileDashboardComponent,
  ],
  bootstrap: [RootComponent],
  providers: [
    { provide: 'configService', useClass: ConfigService },
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
    LoaderService,
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [PlatformLocation],
    },
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
    { provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig },
    { provide: ErrorHandler, useClass: GlobalErrorHandlingService },
    Title,
    UserAgentResolverService,
    // ngx-translate Language Service
    {
      provide: APP_INITIALIZER,
      useFactory: (languageService: LanguageService) => () => {
        return languageService.initializeLanguage()
      },
      deps: [LanguageService],
      multi: true
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule { }

declare global {
  interface Window {
    fcWidget?: any
    webkit?: any
  }
}

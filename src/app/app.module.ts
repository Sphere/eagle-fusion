import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay'
import { APP_BASE_HREF, PlatformLocation } from '@angular/common'
import { CommonModule } from '@angular/common'
import {
  HttpClientJsonpModule,
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http'
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import {
  APP_INITIALIZER,
  Injectable,
  NgModule,
  ErrorHandler,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core'
import { SharedModule } from '../../project/ws/author/src/lib/modules/shared/shared.module'
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
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

import {
  BrowserModule,
  HAMMER_GESTURE_CONFIG,
  Title,
  HammerGestureConfig,
} from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  BtnFeatureModule,
  ErrorResolverModule,
  // TourModule,
  // WIDGET_REGISTERED_MODULES, // Removed - causes static analysis issues
  WIDGET_REGISTRATION_CONFIG,
  PipeContentRoutePipe,
  WIDGET_REGISTERED_MODULES,
} from '@ws-widget/collection'
// import { StickyHeaderModule } from '@ws-widget/collection/src/lib/_common/sticky-header/sticky-header.module'
import { WidgetResolverModule } from '@ws-widget/resolver'
import {
  ImageCropModule,
  LoggerService,
  PipeSafeSanitizerModule,
  LogoutModule,
} from '@ws-widget/utils'
import { SearchModule } from '@ws/app/src/public-api'
import 'hammerjs'
import { KeycloakAngularModule } from 'keycloak-angular'
import { AppRoutingModule } from './app-routing.module'
import { InitService } from './services/init.service'
import { GlobalErrorHandlingService } from './services/global-error-handling.service'
import { AppTocResolverService } from '@ws/app/src/lib/routes/app-toc/resolvers/app-toc-resolver.service'

import { RootComponent } from './component/root/root.component'
import { LoginComponent } from './component/login/login.component'
import { AppNavBarComponent } from './component/app-nav-bar/app-nav-bar.component'
import { InvalidUserComponent } from './component/invalid-user/invalid-user.component'
import { LoginRootComponent } from './component/login-root/login-root.component'
import { LoginRootDirective } from './component/login-root/login-root.directive'
import { PublicAboutModule } from './routes/public/public-about/public-about.module'
import { PublicHomeModule } from './routes/public/public-home/public-home.module'
import { PublicContactModule } from './routes/public/public-contact/public-contact.module'
import { PublicFaqModule } from './routes/public/public-faq/public-faq.module'
import { TncComponent } from './routes/tnc/tnc.component'
import { ForgotPasswordComponent } from './routes/forgot-password/forgot-password.component'

import { AppInterceptorService } from './services/app-interceptor.service'
import { AppRetryInterceptorService } from './services/app-retry-interceptor.service'
import { AssetCacheInterceptorService } from './services/asset-cache-interceptor.service'
import { TncAppResolverService } from './services/tnc-app-resolver.service'
import { TncPublicResolverService } from './services/tnc-public-resolver.service'
import { LanguageService } from './services/language.service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SlidersModule } from './../../library/ws-widget/collection/src/lib/sliders/sliders.module'
import { OrgComponent } from '../../project/ws/app/src/lib/routes/org/components/org/org.component'
import { OrgSelectiveCourseComponent } from '../../project/ws/app/src/lib/routes/org/components/org-selective-course/org-selective-course.component'
import { MdePopoverModule } from '@jaguards/material-extended-mde'
import { CreateAccountComponent } from './routes/create-account/create-account.component'
import { YourLocationComponent } from './routes/your-location/your-location.component'
import { NewTncComponent } from './routes/new-tnc/new-tnc.component'
import { YourBackgroundComponent } from './routes/your-background/your-background.component'
import { CompleteProfileComponent } from './routes/complete-profile/complete-profile.component'
import { HeaderComponent } from './routes/header/header.component'
import { GoogleCallbackComponent } from './routes/google-callback/google-callback.component'

import { BnrcRegisterComponent } from './routes/bnrc-component/bnrc-register.component'
import { UpsmfRegisterComponent } from './routes/upsmf-component/upsmf-register.component'
import { MpRegisterComponent } from './routes/mp-component/mp-register.component'
import { DiscussionUiModule } from '@aastrika_npmjs/discussions-ui-v8'
import { ConfigService } from './routes/discussion-forum/wrapper/service/config.service'
import { LoaderService } from '../../project/ws/author/src/public-api'
import { LanguageDialogComponent } from './routes/language-dialog/language-dialog.component'
import { CreateAccountDialogComponent } from './routes/create-account-modal/create-account-dialog.component'
import { OrganisationsModule } from '../organisations/organisations.module'
import { Capacitor } from '@capacitor/core'
import { SashaktCallbackComponent } from './sashakt-callback/sashakt-callback.component'
import { EntryModule } from '@aastrika_npmjs/comptency/entry-module'
import { SelfAssessmentModule } from '@aastrika_npmjs/comptency/self-assessment'
import { CompetencyModule } from '@aastrika_npmjs/comptency/competency'
import { AppCallBackComponent } from './component/app-call-back/app-call-back.component'
import { WebFeaturedCourseComponent } from './routes/web-featured-course/web-featured-course.component'
import { WebNavLinkPageComponent } from './routes/web-nav-link/web-nav-link-page.component'
import { UserAgentResolverService } from './services/user-agent.service'
import { WebPublicComponent } from './routes/web-public-container/web-public-container.component'
import { WebCourseViewComponent } from './routes/web-course-view/web-course-view.component'
import {
  PipeCountTransformModule,
  PipeDurationTransformModule,
  PipeHtmlTagRemovalModule,
  PipePartialContentModule,
} from '@ws-widget/utils'
import { HorizontalScrollerModule } from '@ws-widget/utils/src/public-api'
import { ScromPlayerComponent } from './routes/public/scrom-player/scrom-player.component'
import { MaternityCallbackComponent } from './maternity-callback/maternity-callback.component'
import { ScrollDetectorDirective } from 'src/app/routes/new-tnc/new-tnc.directive'
import { PublicLoginComponent } from './public-login/public-login.component'
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db'
import { TnaiCallbackComponent } from './tnai-callback/tnai-callback.component'
import { BnrcmodalComponent } from './routes/bnrc-popup/bnrc-modal-component'
import { TnnmcCallbackComponent } from './tnnmc-callback/tnnmc-callback.component'
import { TextFieldModule } from '@angular/cdk/text-field'
import { ProfileViewModule } from './routes/profile-view/profile-view.module'
import { MatTabsModule } from '@angular/material/tabs'
import { UserProfileService } from '../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer'
// import { SearchRootComponent } from '../../project/ws/app/src/lib/routes/search/routes/search-root/search-root.component'

@Injectable()
export class HammerConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement) {
    const options: HammerOptions = {
      touchAction: 'pan-y',
      recognizers: [[Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }]],
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
        localStorage.setItem(`url_before_login`, `app/toc/` + `${url.split('/')[5]}` + `/overview`)
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
      ],
    },
    {
      store: 'userEnrollCourse',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'courseId', keypath: 'courseId', options: { unique: false } },
        { name: 'contentId', keypath: 'contentId', options: { unique: false } },
        { name: 'userId', keypath: 'userId', options: { unique: false } },
        // Add more properties as needed
      ],
    },
  ],
}

// Initialize with empty config for AOT compilation - will be replaced at runtime
export let COMPETENCY_REGISTRATION_CONFIG = {
  config: {},
  isOnlyPassbook: '',
}

// Function to update config from localStorage
export function initializeCompetencyConfig(): () => void {
  return () => {
    try {
      COMPETENCY_REGISTRATION_CONFIG = {
        config: JSON.parse(localStorage.getItem('competency') || '{}'),
        isOnlyPassbook: localStorage.getItem('isOnlyPassbook') || '',
      }
    } catch (error) {
      console.error('Error initializing competency config:', error)
      COMPETENCY_REGISTRATION_CONFIG = {
        config: {},
        isOnlyPassbook: '',
      }
    }
  }
}

// Downtime components imports
import { DowntimeFullComponent } from './component/downtime-full/downtime-full.component'
import { DowntimeBannerComponent } from './component/downtime-banner/downtime-banner.component'

// tslint:disable-next-line: max-classes-per-file
@NgModule({
  declarations: [
    RootComponent,
    TncComponent,
    InvalidUserComponent,
    LoginRootComponent,
    LoginRootDirective,
    OrgComponent,
    OrgSelectiveCourseComponent,
    HeaderComponent,
    GoogleCallbackComponent,
    LanguageDialogComponent,
    CreateAccountDialogComponent,
    SashaktCallbackComponent,
    AppCallBackComponent,
    ScromPlayerComponent,
    MaternityCallbackComponent,
    TnnmcCallbackComponent,
    PublicLoginComponent,
    TnaiCallbackComponent,
    LoginComponent,
    BnrcRegisterComponent,
    UpsmfRegisterComponent,
    MpRegisterComponent,
    ForgotPasswordComponent,
    CreateAccountComponent,
    YourLocationComponent,
    NewTncComponent,
    YourBackgroundComponent,
    CompleteProfileComponent,
    ScrollDetectorDirective,
    AppNavBarComponent,
    BnrcmodalComponent,
    WebFeaturedCourseComponent,
    WebNavLinkPageComponent,
    WebPublicComponent,
    WebCourseViewComponent,
    // SearchRootComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientJsonpModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
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
    MatProgressSpinnerModule,
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
    PipeSafeSanitizerModule,
    LogoutModule,
    SlidersModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTabsModule,
    DiscussionUiModule.forRoot(ConfigService),
    NgxExtendedPdfViewerModule,
    ImageCropModule,
    SharedModule,
    OrganisationsModule,
    EntryModule,
    SelfAssessmentModule,
    CompetencyModule,
    PipeDurationTransformModule,
    PipePartialContentModule,
    PipeCountTransformModule,
    PipeHtmlTagRemovalModule,
    HorizontalScrollerModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    TextFieldModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ProfileViewModule,
    MdePopoverModule,
    DowntimeFullComponent,
    DowntimeBannerComponent,
  ],
  exports: [
    TncComponent,
    ForgotPasswordComponent
  ],
  bootstrap: [RootComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeCompetencyConfig,
      multi: true,
    },
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
    { provide: HTTP_INTERCEPTORS, useClass: AssetCacheInterceptorService, multi: true },
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
      multi: true,
    },
    UserProfileService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en')
    this.translate.use('en')
  }
}

declare global {
  interface Window {
    fcWidget?: any
    webkit?: any
  }
}

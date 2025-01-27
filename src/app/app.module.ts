import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay'
import {
  APP_BASE_HREF, PlatformLocation,
  CommonModule
} from '@angular/common'
import { HttpClientJsonpModule, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { APP_INITIALIZER, Injectable, NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
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
import { MatRippleModule } from '@angular/material/core'
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
import { MatNativeDateModule } from '@angular/material/core'
import { MatSelectModule } from '@angular/material/select'

import { BrowserModule, HAMMER_GESTURE_CONFIG, Title } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  BtnFeatureModule, ErrorResolverModule,
  // TourModule,
  WIDGET_REGISTERED_MODULES, WIDGET_REGISTRATION_CONFIG, PipeContentRoutePipe,
} from '@ws-widget/collection'
// import { StickyHeaderModule } from '@ws-widget/collection/src/lib/_common/sticky-header/sticky-header.module'
import { WidgetResolverModule } from '@ws-widget/resolver'
import {
  ImageCropComponent,
  ImageCropModule,
  LoggerService, PipeSafeSanitizerModule,
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
// import { MobileAppModule } from './routes/public/mobile-app/mobile-app.module'
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
import { BnrcLoginOtpComponent } from './routes/bnrc-login-otp/bnrc-login-otp.component'
import { CreateAccountComponent } from './routes/create-account/create-account.component'
import { YourLocationComponent } from './routes/your-location/your-location.component'
import { NewTncComponent } from './routes/new-tnc/new-tnc.component'
import { YourBackgroundComponent } from './routes/your-background/your-background.component'
import { AlmostDoneComponent } from './routes/almost-done/almost-done.component'
import { CompleteProfileComponent } from './routes/complete-profile/complete-profile.component'
import { HeaderComponent } from './routes/header/header.component'
import { GoogleCallbackComponent } from './routes/google-callback/google-callback.component'
import { MobileDashboardComponent } from './routes/mobile-dashboard/mobile-dashboard.component'

import { BnrcRegisterComponent } from './routes/bnrc-component/bnrc-register.component'
import { UpsmfRegisterComponent } from './routes/upsmf-component/upsmf-register.component'

// import { MobileCategoryComponent } from './routes/mobile-category/mobile-category.component'
// import { MobileVideoPlayerComponent } from './routes/mobile-video-player/mobile-video-player.component'
import { MobileFooterComponent } from './routes/mobile-footer/mobile-footer.component'
import { DiscussionUiModule } from '@aastrika_npmjs/discussions-ui-v8'
import { ConfigService } from './routes/discussion-forum/wrapper/service/config.service'
import { MobileProfileDashboardComponent } from './routes/profile-view/mobile-profile-dashboard/mobile-profile-dashboard.component'
import { MobileAboutPopupComponent } from './routes/mobile-about-popup/mobile-about-popup.component'
import { ProfileSelectComponent } from './routes/profile-view/profile-select/profile-select.component'
import { EducationListComponent } from './routes/profile-view/education-list/education-list.component'
import { EducationEditComponent } from './routes/profile-view/education-edit/education-edit.component'
import { MobileProfileNavComponent } from './routes/profile-view/mobile-profile-nav/mobile-profile-nav.component'
import { WorkInfoListComponent } from './routes/profile-view/work-info-list/work-info-list.component'
import { WorkInfoEditComponent } from './routes/profile-view/work-info-edit/work-info-edit.component'
import { CertificateReceivedComponent } from './routes/profile-view/certificate-received/certificate-received.component'
import { PersonalDetailEditComponent } from './routes/profile-view/personal-detail-edit/personal-detail-edit.component'
import { LoaderService } from '../../project/ws/author/src/public-api'
import { SharedModule } from '../../project/ws/author/src/lib/modules/shared/shared.module'
import { NotificationComponent } from '../../project/ws/author/src/lib/modules/shared/components/notification/notification.component'
import { LanguageDialogComponent } from './routes/language-dialog/language-dialog.component'
import { CreateAccountDialogComponent } from './routes/create-account-modal/create-account-dialog.component'
import { DropdownDobComponent } from 'src/app/component/dropdown-dob/dropdown-dob.component'
import { OrganisationsModule } from '../organisations/organisations.module'
import { Capacitor } from '@capacitor/core'
import { SashaktCallbackComponent } from './sashakt-callback/sashakt-callback.component'
import { SelfAssessmentComponent } from './routes/self-assessment/self-assessment.component'
// import { EntryModule } from '@aastrika_npmjs/competency-web/entry-module'
import { EntryModule } from '@aastrika_npmjs/competency-web/entry-module'
import { SelfAssessmentModule } from '@aastrika_npmjs/competency-web/self-assessment'
import { CompetencyModule } from '@aastrika_npmjs/competency-web/competency'
import { COMPETENCY_REGISTRATION_CONFIG } from './routes/competency/competency.config'
import { AppCallBackComponent } from './component/app-call-back/app-call-back.component'
import { WebHowDoesWorkComponent } from './routes/web-how-does-work/web-how-does-work.component'
import { WebFeaturedCourseComponent } from './routes/web-featured-course/web-featured-course.component'
import { WebTrustedByPageComponent } from './routes/web-trusted-by-page/web-trusted-by-page.component'
import { WebNavLinkPageComponent } from './routes/web-nav-link/web-nav-link-page.component'
import { WebDashboardComponent } from './routes/web-dashboard/web-dashboard.component'
import { UserAgentResolverService } from './services/user-agent.service'
import { WebPublicComponent } from './routes/web-public-container/web-public-container.component'
import { WebCourseViewComponent } from './routes/web-course-view/web-course-view.component'
import { WebCourseCardComponent } from './routes/web-course-card/web-course-card.component'
import { WebEkshamataPublicComponent } from './routes/web-ekshamata-public-container/web-ekshamata-public-container.component'
import { PipeCountTransformModule, PipeDurationTransformModule, PipeHtmlTagRemovalModule, PipePartialContentModule } from '@ws-widget/utils'
import { HorizontalScrollerModule } from '@ws-widget/utils/src/public-api'
import { ScromPlayerComponent } from './routes/public/scrom-player/scrom-player.component'
import { VideoPopupComponent } from './routes/how-does-it-works-popup/how-does-it-works-popup.component'
import { MaternityCallbackComponent } from './maternity-callback/maternity-callback.component'
import { MyCoursesComponent } from './component/my-courses/my-courses.component'
import { ScrollDetectorDirective } from 'src/app/routes/new-tnc/new-tnc.directive'
import { CarouselComponentComponent } from '../app/routes/carousel-banner/carousel-component.component'
import { PublicLoginComponent } from './public-login/public-login.component'
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db'
import { TnaiCallbackComponent } from './tnai-callback/tnai-callback.component'
import { BnrcmodalComponent } from './routes/bnrc-popup/bnrc-modal-component'
// import { SettingsComponent } from 'project/ws/app/src/lib/routes/profile/routes/settings/settings.component'
import { HammerGestureConfig } from '@angular/platform-browser'

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
    BnrcLoginOtpComponent,
    CreateAccountComponent,
    BnrcRegisterComponent,
    UpsmfRegisterComponent,
    YourLocationComponent,
    NewTncComponent,
    YourBackgroundComponent,
    AlmostDoneComponent,
    CompleteProfileComponent,
    HeaderComponent,
    GoogleCallbackComponent,
    MobileDashboardComponent,
    // MobileCategoryComponent,
    // MobileVideoPlayerComponent,
    MobileFooterComponent,
    MobileProfileDashboardComponent,
    MobileAboutPopupComponent,
    ProfileSelectComponent,
    EducationListComponent,
    EducationEditComponent,
    WorkInfoListComponent,
    WorkInfoEditComponent,
    MobileProfileNavComponent,
    CertificateReceivedComponent,
    PersonalDetailEditComponent,
    LanguageDialogComponent,
    CreateAccountDialogComponent,
    DropdownDobComponent,
    SashaktCallbackComponent,
    SelfAssessmentComponent,
    AppCallBackComponent,
    WebHowDoesWorkComponent,
    VideoPopupComponent,
    WebFeaturedCourseComponent,
    WebTrustedByPageComponent,
    WebNavLinkPageComponent,
    WebDashboardComponent,
    WebPublicComponent,
    WebEkshamataPublicComponent,
    WebCourseViewComponent,
    WebCourseCardComponent,
    ScromPlayerComponent,
    MaternityCallbackComponent,
    MyCoursesComponent,
    ScrollDetectorDirective,
    CarouselComponentComponent,
    PublicLoginComponent,
    TnaiCallbackComponent,
    // SettingsComponent
    BnrcmodalComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    CommonModule,
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserAnimationsModule,
    KeycloakAngularModule,
    AppRoutingModule,
    ...WIDGET_REGISTERED_MODULES,
    WidgetResolverModule.forRoot(WIDGET_REGISTRATION_CONFIG),
    // StickyHeaderModule,
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
    SearchModule,
    BtnFeatureModule,
    PublicAboutModule,
    PublicHomeModule,
    PublicContactModule,
    PublicFaqModule,
    // MobileAppModule,
    PipeSafeSanitizerModule,
    // TourModule,
    SlidersModule,
    MdePopoverModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatExpansionModule,
    DiscussionUiModule.forRoot(ConfigService),
    ImageCropModule,
    SharedModule,
    OrganisationsModule,
    EntryModule.forRoot(COMPETENCY_REGISTRATION_CONFIG),
    SelfAssessmentModule,
    CompetencyModule.forRoot(COMPETENCY_REGISTRATION_CONFIG),
    PipeDurationTransformModule,
    PipePartialContentModule,
    PipeCountTransformModule,
    PipeHtmlTagRemovalModule,
    HorizontalScrollerModule,
    NgxIndexedDBModule.forRoot(dbConfig)
  ],
  exports: [
    TncComponent, AppPublicNavBarComponent, RegisterComponent, ForgotPasswordComponent,
    MobileDashboardComponent,
    CertificateReceivedComponent,
  ],
  bootstrap: [RootComponent],
  entryComponents: [
    BnrcmodalComponent,
    DialogConfirmComponent,
    LoginComponent,
    ProfileSelectComponent,
    ImageCropComponent,
    NotificationComponent,
    LanguageDialogComponent,
    CreateAccountDialogComponent,
    VideoPopupComponent
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }

declare global {
  interface Window {
    fcWidget?: any
    webkit?: any
  }
}

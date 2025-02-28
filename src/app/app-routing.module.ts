import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ErrorResolverComponent, PageComponent, PageModule } from '@ws-widget/collection'
import { ExploreDetailResolve, PageResolve } from '@ws-widget/utils'
// import { LearningGuard } from '../../project/ws/app/src/lib/routes/my-learning/guards/my-learning.guard'
// import { BtnProfileComponent } from '../../library/ws-widget/collection/src/lib/btn-profile/btn-profile.component'
import { InvalidUserComponent } from './component/invalid-user/invalid-user.component'
import { LoginRootComponent } from './component/login-root/login-root.component'
import { ETopBar } from './constants/topBar.constants'
import { ExternalUrlResolverService } from './guards/external-url-resolver.service'
import { GeneralGuard } from './guards/general.guard'
import { LoginGuard } from './guards/login.guard'
import { FeaturesComponent } from './routes/features/features.component'
import { FeaturesModule } from './routes/features/features.module'
// import { MobileAppHomeComponent } from './routes/public/mobile-app/components/mobile-app-home.component'
import { PublicAboutComponent } from './routes/public/public-about/public-about.component'
import { PublicHomeComponent } from './routes/public/public-home/public-home.component'
// import { WebEkshamataPublicComponent } from './routes/web-ekshamata-public-container/web-ekshamata-public-container.component'
import { PublicTocComponent } from './routes/public/public-toc/public-toc.component'
import { PublicTocOverviewComponent } from './routes/public/public-toc-overview/public-toc-overview.component'
import { PublicContactComponent } from './routes/public/public-contact/public-contact.component'
import { PublicFaqComponent } from './routes/public/public-faq/public-faq.component'
import { TncComponent } from './routes/tnc/tnc.component'
import { RegisterComponent } from './routes/register/register.component'
import { ForgotPasswordComponent } from './routes/forgot-password/forgot-password.component'
import { TncAppResolverService } from './services/tnc-app-resolver.service'
import { TncPublicResolverService } from './services/tnc-public-resolver.service'
import { AppTocResolverService } from '@ws/app/src/lib/routes/app-toc/resolvers/app-toc-resolver.service'
import { OrgComponent } from '../../project/ws/app/src/lib/routes/org/components/org/org.component'
import { OrgServiceService } from '../../project/ws/app/src/lib/routes/org/org-service.service'
import { MobileLoginComponent as loginComponent } from './routes/mobile-login/mobile-login.component'
import { LoginOtpComponent } from './routes/login-otp/login-otp.component'

import { BnrcLoginOtpComponent } from './routes/bnrc-login-otp/bnrc-login-otp.component'
import { CreateAccountComponent } from './routes/create-account/create-account.component'
import { BnrcRegisterComponent } from './routes/bnrc-component/bnrc-register.component'
import { UpsmfRegisterComponent } from './routes/upsmf-component/upsmf-register.component'

import { YourLocationComponent as AboutYou } from './routes/your-location/your-location.component'
import { NewTncComponent } from './routes/new-tnc/new-tnc.component'
import { CompleteProfileComponent } from './routes/complete-profile/complete-profile.component'
import { GoogleCallbackComponent } from './routes/google-callback/google-callback.component'
// import { MobileVideoPlayerComponent } from './routes/mobile-video-player/mobile-video-player.component'
import { MobileProfileDashboardComponent } from './routes/profile-view/mobile-profile-dashboard/mobile-profile-dashboard.component'
import { MobileAboutPopupComponent } from './routes/mobile-about-popup/mobile-about-popup.component'
import { EducationListComponent } from './routes/profile-view/education-list/education-list.component'
import { EducationEditComponent } from './routes/profile-view/education-edit/education-edit.component'
import { WorkInfoListComponent } from './routes/profile-view/work-info-list/work-info-list.component'
import { WorkInfoEditComponent } from './routes/profile-view/work-info-edit/work-info-edit.component'
import { PersonalDetailEditComponent } from './routes/profile-view/personal-detail-edit/personal-detail-edit.component'
import { KeycloakCallbackComponent } from './routes/public/keycloak-callback/keycloak-callback.component'
import { SashaktCallbackComponent } from './sashakt-callback/sashakt-callback.component'
import { MaternityCallbackComponent } from './maternity-callback/maternity-callback.component'
import { OrgHomeComponent } from '../organisations/org-home/org-home.component'
import { SelfAssessmentComponent } from './routes/self-assessment/self-assessment.component'
import { CompetencyDashboardComponent } from '@aastrika_npmjs/competency-web/competency'
import { SelfAssessmentGuard } from './guards/self-assessment.guard'
import { AppCallBackComponent } from './component/app-call-back/app-call-back.component'
import { ScromPlayerComponent } from './routes/public/scrom-player/scrom-player.component'
import { MyCoursesComponent } from './component/my-courses/my-courses.component'
import { PublicLoginComponent } from './public-login/public-login.component'
import { TnaiCallbackComponent } from 'src/app/tnai-callback/tnai-callback.component'
import { NotificationsComponent } from './routes/notification/notification.component'

// import { SettingsComponent } from 'project/ws/app/src/lib/routes/profile/routes/settings/settings.component'
// 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
// Please declare routes in alphabetical order
// 😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵
let domain = window.location.hostname
// this.domain = window.location.hostname

const routes: Routes = [
  {
    path: '',
    redirectTo: 'public/home',
    pathMatch: 'full',
    data: { title: 'Home - Aastrika Sphere' },
  },
  {
    path: 'public/home',
    component: PublicHomeComponent,
    data: {
      title: domain.includes('ekshamata') ? 'Home - Ekshamata' : 'Home - Aastrika Sphere',
      pageType: 'public',
      pageKey: 'id',
      isPublic: true,
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'aboutpoppage',
    component: MobileAboutPopupComponent,
  },
  {
    path: 'app',
    loadChildren: () =>
      import('./routes/route-disussion.module').then(u => u.RouteDiscussModule),
    canActivate: [GeneralGuard],
    data: {
      pageType: 'feature',
      pageKey: 'discuss',
      pageId: 'app',
      module: 'Discuss',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'bnrc/register',
    component: BnrcRegisterComponent,
  },
  {
    path: 'upsmf/register',
    component: UpsmfRegisterComponent,
  },
  {
    path: 'app/about-you',
    component: AboutYou,
  },
  {
    path: 'app/create-account',
    component: CreateAccountComponent,
  },
  {
    path: 'app/complete-profile',
    component: CompleteProfileComponent,
  },
  {
    path: 'app/education-list',
    component: EducationListComponent,
  },
  {
    path: 'app/education-edit',
    component: EducationEditComponent,
  },
  {
    path: 'app/email-otp',
    component: LoginOtpComponent,
  },
  {
    path: 'app/bnrc-email-otp',
    component: BnrcLoginOtpComponent,
  },
  {
    path: 'app/features',
    component: FeaturesComponent,
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/invalid-user',
    component: InvalidUserComponent,
    data: {
      pageType: 'feature',
      pageKey: 'invalid-user',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'app/login',
    component: loginComponent,
  },
  {
    path: 'public/login',
    component: PublicLoginComponent,
  },
  {
    path: 'app/mobile-otp',
    component: LoginOtpComponent,
  },
  {
    path: 'app/new-tnc',
    component: NewTncComponent,
    resolve: {
      tnc: TncPublicResolverService,
    },
  },
  {
    path: 'app/org-details',
    component: OrgComponent,
    resolve: {
      orgData: OrgServiceService,
    },
  },
  {
    path: 'app/personal-detail-edit',
    component: PersonalDetailEditComponent,
  },
  {
    path: 'app/person-profile',
    loadChildren: () =>
      import('./routes/route-person-profile.module').then(u => u.RoutePersonProfileModule),
    canActivate: [GeneralGuard],
  },
  // {
  //   path: 'app/profile/dashboard',
  //   redirectTo: 'app/profile-view',
  // },
  {
    path: 'app/profile',
    loadChildren: () =>
      import('./routes/route-profile-app.module').then(u => u.RouteProfileAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/profile-view',
    component: MobileProfileDashboardComponent,
    canActivate: [GeneralGuard],
  },
  // {
  //   path: 'app/profile/settings',
  //   component: SettingsComponent,
  // },
  {
    path: 'app/search',
    loadChildren: () =>
      import('./routes/route-search-app.module').then(u => u.RouteSearchAppModule),
    data: {
      pageType: 'feature',
      pageKey: 'search',
    },
    resolve: {
      searchPageData: PageResolve,
    },
    // canActivate: [EmptyRouteGuard],
  },
  {
    path: 'app/signup',
    loadChildren: () =>
      import('./routes/signup/signup.module').then(u => u.SignupModule),
  },
  {
    path: 'app/tnc',
    component: TncComponent,
    resolve: {
      tnc: TncAppResolverService,
    },
  },
  {
    path: 'app/toc',
    loadChildren: () => import('./routes/route-app-toc.module').then(u => u.RouteAppTocModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'hi/app/toc',
    loadChildren: () => import('./routes/route-app-toc.module').then(u => u.RouteAppTocModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/user-profile',
    loadChildren: () =>
      import('./routes/route-user-profile-app.module').then(u => u.RouteUserProfileAppModule),
  },
  {
    path: 'app/user/self-assessment',
    component: SelfAssessmentComponent, canActivate: [SelfAssessmentGuard],
  },
  {
    path: 'app/user/competency', component: CompetencyDashboardComponent,
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/user/my_courses', component: MyCoursesComponent,
    canActivate: [GeneralGuard]
  },
  {
    path: 'notification',
    component: NotificationsComponent,
    data: { animation: 'notification' }
  },
  // {
  //   path: 'app/video-player',
  //   component: MobileVideoPlayerComponent,
  // },
  {
    path: 'app/workinfo-edit',
    component: WorkInfoEditComponent,
  },
  {
    path: 'app/workinfo-list',
    component: WorkInfoListComponent,
  },
  {
    path: 'author/viewer',
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'certs',
    loadChildren: () => import('./routes/route-cert.module').then(u => u.RouteCertificateModule),
  },
  {
    path: 'embed',
    data: {
      topBar: ETopBar.NONE,
    },
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'error-access-forbidden',
    component: ErrorResolverComponent,
    data: {
      errorType: 'accessForbidden',
    },
  },
  {
    path: 'error-content-unavailable',
    component: ErrorResolverComponent,
    data: {
      errorType: 'contentUnavailable',
    },
  },
  {
    path: 'error-feature-disabled',
    component: ErrorResolverComponent,
    data: {
      errorType: 'featureDisabled',
    },
  },
  {
    path: 'error-feature-unavailable',
    component: ErrorResolverComponent,
    data: {
      errorType: 'featureUnavailable',
    },
  },
  {
    path: 'error-internal-server',
    component: ErrorResolverComponent,
    data: {
      errorType: 'internalServer',
    },
  },
  {
    path: 'error-service-unavailable',
    component: ErrorResolverComponent,
    data: {
      errorType: 'serviceUnavailable',
    },
  },
  {
    path: 'error-somethings-wrong',
    component: ErrorResolverComponent,
    data: {
      errorType: 'somethingsWrong',
    },
  },
  {
    path: 'externalRedirect',
    canActivate: [ExternalUrlResolverService],
    component: ErrorResolverComponent,
  },
  {
    path: 'google/callback',
    component: GoogleCallbackComponent,
  },
  { path: 'home', redirectTo: 'page/home', pathMatch: 'full' },
  { path: 'hi/hi/page/home', redirectTo: 'hi/page/home', pathMatch: 'full' },
  {
    path: 'hi/app/profile',
    loadChildren: () =>
      import('./routes/route-profile-app.module').then(u => u.RouteProfileAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'hi/app/profile-view',
    component: MobileProfileDashboardComponent,
    canActivate: [GeneralGuard],
  },
  {
    path: 'login',
    canActivate: [LoginGuard],
    component: LoginRootComponent,
    data: {
      pageType: 'feature',
      pageKey: 'login',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'openid/keycloak',
    component: KeycloakCallbackComponent,
  },
  {
    path: 'openid/sashakt',
    component: SashaktCallbackComponent,
  },
  {
    path: 'openid/maternity',
    component: MaternityCallbackComponent,
  },
  {
    path: 'openid/sphereapp',
    component: AppCallBackComponent,

  },
  {
    path: 'openid/tnai',
    component: TnaiCallbackComponent,
  },
  {
    path: 'organisations',
    loadChildren: () => import('../organisations/organisations.module').then(u => u.OrganisationsModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'public/organisations/home',
    component: OrgHomeComponent,
  },
  {
    path: 'page/toc',
    redirectTo: '/',
    pathMatch: 'full',
  },
  {
    path: 'page/toc/:id',
    data: {
      pageType: 'page',
      pageKey: 'toc',
    },
    resolve: {
      pageData: PageResolve,
      content: AppTocResolverService,
    },
    runGuardsAndResolvers: 'paramsChange',
    component: PageComponent,
    canActivate: [GeneralGuard],
  },
  {
    path: 'page/:id',
    component: PageComponent,
    data: {
      pageType: 'page',
      pageKey: 'id',
    },
    resolve: {
      pageData: PageResolve,
    },
    canActivate: [GeneralGuard],
  },
  // {
  //   path: 'page/explore/:tags',
  //   data: {
  //     pageType: 'page',
  //     pageKey: 'catalog-details',
  //   },
  //   resolve: {
  //     pageData: ExploreDetailResolve,
  //   },
  //   component: PageComponent,
  //   // canActivate: [GeneralGuard],
  // },
  {
    path: 'page-leaders',
    loadChildren: () =>
      import('./routes/page-leader-renderer/page-leader-renderer.module').then(
        u => u.PageLeaderRendererModule,
      ),
    canActivate: [GeneralGuard],
  },
  {
    path: 'public/about',
    component: PublicAboutComponent,
    data: {
      title: 'About - Aastrika',
      pageType: 'feature',
      pageKey: 'about',
      isPublic: true,
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'public/contact',
    component: PublicContactComponent,
    data: {
      pageType: 'feature',
      pageKey: 'public-faq',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  // {
  //   path: 'public/mobile-app',
  //   component: MobileAppHomeComponent,
  //   data: {
  //     pageType: 'feature',
  //     pageKey: 'mobile-app',
  //   },
  //   resolve: {
  //     pageData: PageResolve,
  //   },
  // },
  {
    path: 'public/tnc',
    component: TncComponent,
    data: {
      title: 'Terms of Use - Aastrika',
      isPublic: true,
    },
    resolve: {
      tnc: TncPublicResolverService,
    },
  },
  {
    path: 'public/register',
    component: RegisterComponent,
  },
  {
    path: 'public/forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'public/toc',
    component: PublicTocComponent,
    children: [
      {
        path: 'overview',
        component: PublicTocOverviewComponent,
      },
    ],
  },
  {
    path: 'public/faq/:tab',
    component: PublicFaqComponent,
  },
  {
    path: 'public/scrom-player',
    component: ScromPlayerComponent,
  },
  { path: 'resources', redirectTo: 'page/home', pathMatch: 'full' },
  {
    path: 'viewer',
    data: {
      topBar: ETopBar.NONE,
    },
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'hi/viewer',
    data: {
      topBar: ETopBar.NONE,
    },
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
    canActivate: [GeneralGuard],
  },
  {
    path: '**',
    component: ErrorResolverComponent,
    data: {
      errorType: 'notFound',
    },
  },
]
@NgModule({
  imports: [
    PageModule,
    FeaturesModule,
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'top',
      urlUpdateStrategy: 'eager',
    }),
  ],
  exports: [RouterModule],
  providers: [ExploreDetailResolve],
})
export class AppRoutingModule {
  paramsJSON!: string
  userAgent!: string

  constructor() {

  }

}

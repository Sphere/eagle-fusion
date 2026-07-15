import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ErrorResolverComponent, PageComponent, PageModule } from '@ws-widget/collection'
import { ExploreDetailResolve, PageResolve } from '@ws-widget/utils'
import { LoginRootComponent } from './component/login-root/login-root.component'
import { ExternalUrlResolverService } from './guards/external-url-resolver.service'
import { GeneralGuard } from './guards/general.guard'
import { LoginGuard } from './guards/login.guard'
import { EmptyRouteGuard } from './guards/empty-route.guard'
import { PublicHomeComponent } from './routes/public/public-home/public-home.component'
import { PublicTocComponent } from './routes/public/public-toc/public-toc.component'
import { PublicTocOverviewComponent } from './routes/public/public-toc-overview/public-toc-overview.component'
import { PublicBlogListComponent } from './routes/public/public-blog/public-blog-list.component'
import { PublicBlogArticleComponent } from './routes/public/public-blog/public-blog-article.component'
import { TncComponent } from './routes/tnc/tnc.component'
import { RegisterComponent } from './routes/register/register.component'
import { ForgotPasswordComponent } from './routes/forgot-password/forgot-password.component'
import { TncAppResolverService } from './services/tnc-app-resolver.service'
import { TncPublicResolverService } from './services/tnc-public-resolver.service'
import { AppTocResolverService } from '@ws/app/src/lib/routes/app-toc/resolvers/app-toc-resolver.service'
import { OrgComponent } from '../../project/ws/app/src/lib/routes/org/components/org/org.component'
import { MobileLoginComponent as loginComponent } from './routes/mobile-login/mobile-login.component'
import { LoginOtpComponent } from './routes/login-otp/login-otp.component'

import { BnrcLoginOtpComponent } from './routes/bnrc-login-otp/bnrc-login-otp.component'
import { CreateAccountComponent } from './routes/create-account/create-account.component'
import { BnrcRegisterComponent } from './routes/bnrc-component/bnrc-register.component'
import { UpsmfRegisterComponent } from './routes/upsmf-component/upsmf-register.component'

import { YourLocationComponent as AboutYou } from './routes/your-location/your-location.component'
import { NewTncComponent } from './routes/new-tnc/new-tnc.component'
import { GoogleCallbackComponent } from './routes/google-callback/google-callback.component'
import { MobileProfileDashboardComponent } from './routes/profile-view/mobile-profile-dashboard/mobile-profile-dashboard.component'
import { EducationListComponent } from './routes/profile-view/education-list/education-list.component'
import { EducationEditComponent } from './routes/profile-view/education-edit/education-edit.component'
import { WorkInfoListComponent } from './routes/profile-view/work-info-list/work-info-list.component'
import { WorkInfoEditComponent } from './routes/profile-view/work-info-edit/work-info-edit.component'
import { PersonalDetailEditComponent } from './routes/profile-view/personal-detail-edit/personal-detail-edit.component'
import { KeycloakCallbackComponent } from './routes/public/keycloak-callback/keycloak-callback.component'
import { SashaktCallbackComponent } from './sashakt-callback/sashakt-callback.component'
import { MaternityCallbackComponent } from './maternity-callback/maternity-callback.component'
import { TnnmcCallbackComponent } from './tnnmc-callback/tnnmc-callback.component'
import { MNCCallbackComponent } from './mnc-callback/mnc-callback.component'
import { OrgHomeComponent } from './routes/organisations/org-home/org-home.component'
import { SelfAssessmentComponent } from './routes/self-assessment/self-assessment.component'
import { SelfAssessmentGuard } from './guards/self-assessment.guard'
import { AppCallBackComponent } from './component/app-call-back/app-call-back.component'
import { ScromPlayerComponent } from './routes/public/scrom-player/scrom-player.component'
import { MyCoursesComponent } from './component/my-courses/my-courses.component'
import { PublicLoginComponent } from './routes/public-login/public-login.component'
import { TnaiCallbackComponent } from 'src/app/tnai-callback/tnai-callback.component'
import { NotificationsComponent } from './routes/notification/notification.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { MpRegisterComponent } from './routes/mp-component/mp-register.component'
// 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
// Please declare routes in alphabetical order
// 😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵
const domain = typeof window !== 'undefined' ? window.location.hostname : ''
// this.domain = window.location.hostname

const routes: Routes = [
  {
    path: '',
    redirectTo: 'public/home',
    pathMatch: 'full',
    data: { title: 'Aastrika Sphere - Home' },
  },
  {
    path: 'public/home',
    component: PublicHomeComponent,
    data: {
      title: domain.includes('localhost')
        ? 'Ekshamata - Free CNE Courses for Healthcare Professionals'
        : 'Aastrika Sphere - Free CNE Courses | INC Certified | Healthcare Training',
      seoDescription: 'Earn CNE points and INC certification with free online healthcare courses on Aastrika Sphere. Courses on maternal health, newborn care, midwifery, and more — designed for nurses, midwives, and healthcare workers across India.',
      seoKeywords: 'CNE points, CNE credits, INC certification, free healthcare courses, nursing courses online, maternal health training, newborn care, midwifery courses, healthcare e-learning India, Aastrika Sphere',
      pageType: 'public',
      pageKey: 'id',
      isPublic: true,
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'app',
    loadChildren: () =>
      import('./routes/route-disussion.module').then(u => u.RouteDiscussModule),
    canActivate: [GeneralGuard, EmptyRouteGuard],
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
    data: {
      title: 'Aastrika Sphere - Bnrc Registration',
    },
    component: BnrcRegisterComponent,
  },
  {
    path: 'uttarpradesh/register',
    data: {
      title: 'Aastrika Sphere - Uttar Pradesh Registration',
    },
    component: UpsmfRegisterComponent,
  },
  {
    path: 'madhyapradesh/register',
    data: {
      title: 'Aastrika Sphere - Madhya Pradesh Registration',
    },
    component: MpRegisterComponent,
  },
  {
    path: 'app/about-you',
    component: AboutYou,
  },
  {
    path: 'app/create-account',
    data: {
      title: 'Aastrika Sphere - Create Account',
    },
    component: CreateAccountComponent,
  },
  {
    path: ':lang/app/create-account',
    data: {
      title: 'Aastrika Sphere - Create Account',
    },
    component: CreateAccountComponent,
  },
  {
    path: 'app/create-account/:stateCode/:orgName/:role',
    component: CreateAccountComponent,
    data: {
      title: 'Create Account',
    },
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
    path: 'app/login',
    component: loginComponent,
  },
  {
    path: 'public/login',
    data: {
      title: 'Login - Aastrika Sphere',
      seoDescription: 'Log in to Aastrika Sphere to access your healthcare training courses, track progress, and earn certifications.',
    },
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
    // Resolver removed: OrgServiceService.resolve() was fetching a non-existent
    // assets/configurations/orgmeta.config.json (404) on every navigation, and
    // OrgComponent never read the resolver result — it loads its own data via
    // /assets/orgMeta.json directly in loadOrgData().
  },
  {
    path: 'app/personal-detail-edit',
    component: PersonalDetailEditComponent,
  },
  {
    path: 'app/person-profile',
    loadChildren: () =>
      import('./routes/route-person-profile.module').then(u => u.RoutePersonProfileModule),
    canActivate: [GeneralGuard, EmptyRouteGuard],
  },
  {
    path: 'app/profile',
    loadChildren: () =>
      import('./routes/route-profile-app.module').then(u => u.RouteProfileAppModule),
    canActivate: [GeneralGuard, EmptyRouteGuard],
  },
  {
    path: 'app/profile-view',
    component: MobileProfileDashboardComponent,
    canActivate: [GeneralGuard, EmptyRouteGuard],
  },
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
    canActivate: [EmptyRouteGuard],
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
    canActivate: [GeneralGuard, EmptyRouteGuard],
  },
  {
    path: 'app/user-profile',
    loadChildren: () =>
      import('./routes/route-user-profile-app.module').then(u => u.RouteUserProfileAppModule),
  },
  {
    path: 'app/user/self-assessment',
    component: SelfAssessmentComponent,
    canActivate: [SelfAssessmentGuard, EmptyRouteGuard],
  },
  {
    path: 'app/user/competency',
    loadChildren: () =>
      import('./routes/competency/competency.module').then(u => u.CompetencyModule),
    canActivate: [GeneralGuard, EmptyRouteGuard],
  },
  {
    path: 'app/user/my_courses',
    component: MyCoursesComponent,
    canActivate: [GeneralGuard, EmptyRouteGuard],
  },
  {
    path: 'notification',
    component: NotificationsComponent,
    canActivate: [GeneralGuard, EmptyRouteGuard],
    data: { animation: 'notification' },
  },
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
    canActivate: [GeneralGuard, EmptyRouteGuard],
  },
  {
    path: 'certs',
    loadChildren: () => import('./routes/route-cert.module').then(u => u.RouteCertificateModule),
  },
  {
    path: 'embed',
    data: {
      topBar: 'NONE',
    },
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
    canActivate: [GeneralGuard, EmptyRouteGuard],
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
  {
    path: 'login',
    canActivate: [LoginGuard, EmptyRouteGuard],
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
    path: 'openid/tnnmc',
    component: TnnmcCallbackComponent,
  },
  {
    path: 'openid/mnc',
    component: MNCCallbackComponent,
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
    loadChildren: () => import('./routes/organisations/organisations.module').then(u => u.OrganisationsModule),
    canActivate: [GeneralGuard, EmptyRouteGuard],
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
    canActivate: [GeneralGuard, EmptyRouteGuard],
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
    canActivate: [GeneralGuard, EmptyRouteGuard],
  },
  {
    path: 'public/about',
    // component: PublicAboutComponent,
    loadChildren: () => import('./routes/public/public-about/public-about.module').then(u => u.PublicAboutModule),
    data: {
      title: 'About Us - Aastrika Sphere',
      seoDescription: 'Learn about Aastrika Sphere — a digital platform enabling health system strengthening and capacity building for healthcare professionals across India.',
      pageType: 'feature',
      pageKey: 'about',
      isPublic: true,
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'public/blog',
    component: PublicBlogListComponent,
    data: {
      title: 'Healthcare Training Blog | Aastrika Sphere',
      isPublic: true,
    },
  },
  {
    path: 'public/blog/:slug',
    component: PublicBlogArticleComponent,
    data: { isPublic: true },
  },
  {
    path: 'public/tnc',
    component: TncComponent,
    data: {
      title: 'Terms of Use - Aastrika Sphere',
      seoDescription: 'Read the Terms of Use for Aastrika Sphere, the digital healthcare training platform.',
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
    data: {
      title: 'Aastrika Sphere - Free Certified Healthcare Courses | CNE Points',
      seoDescription: 'Explore free certified healthcare training courses on Aastrika Sphere. Earn CNE points and INC certification in maternal health, newborn care, and more.',
      seoKeywords: 'CNE points, CNE credits, INC certification, free healthcare courses, nursing courses online, maternal health, newborn care, Aastrika Sphere',
    },
    children: [
      {
        path: 'overview/:courseId/:slug',
        component: PublicTocOverviewComponent,
      },
      {
        path: 'overview/:slug',
        component: PublicTocOverviewComponent, // fallback when courseId is query param
      },
      {
        path: 'overview',
        component: PublicTocOverviewComponent, // fallback for query param only
      },
    ],
  },
  {
    path: 'public/faq/:tab',
    // component: PublicFaqComponent,
    loadChildren: () => import('./routes/public/public-faq/public-faq.module').then(u => u.PublicFaqModule),
  },
  {
    path: 'public/scrom-player',
    component: ScromPlayerComponent,
  },
  { path: 'resources', redirectTo: 'page/home', pathMatch: 'full' },
  {
    path: 'viewer',
    data: {
      topBar: 'NONE',
    },
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
    canActivate: [GeneralGuard, EmptyRouteGuard],
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
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'top',
      urlUpdateStrategy: 'eager',
    }),
  ],
  exports: [RouterModule],
  providers: [ExploreDetailResolve],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppRoutingModule {
  paramsJSON!: string
  userAgent!: string

  constructor() {

  }

}

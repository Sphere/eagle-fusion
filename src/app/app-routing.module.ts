import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ErrorResolverComponent, PageComponent, PageModule } from '@ws-widget/collection'
import { ExploreDetailResolve, PageResolve } from '@ws-widget/utils'
import { LearningGuard } from '../../project/ws/app/src/lib/routes/my-learning/guards/my-learning.guard'
// import { BtnProfileComponent } from '../../library/ws-widget/collection/src/lib/btn-profile/btn-profile.component'
import { InvalidUserComponent } from './component/invalid-user/invalid-user.component'
import { LoginRootComponent } from './component/login-root/login-root.component'
import { ETopBar } from './constants/topBar.constants'
import { ExternalUrlResolverService } from './guards/external-url-resolver.service'
import { GeneralGuard } from './guards/general.guard'
import { LoginGuard } from './guards/login.guard'
import { FeaturesComponent } from './routes/features/features.component'
import { FeaturesModule } from './routes/features/features.module'
import { MobileAppHomeComponent } from './routes/public/mobile-app/components/mobile-app-home.component'
import { PublicAboutComponent } from './routes/public/public-about/public-about.component'
import { PublicHomeComponent } from './routes/public/public-home/public-home.component'
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
import { CreateAccountComponent } from './routes/create-account/create-account.component'
import { YourLocationComponent as AboutYou } from './routes/your-location/your-location.component'
import { NewTncComponent } from './routes/new-tnc/new-tnc.component'
import { CompleteProfileComponent } from './routes/complete-profile/complete-profile.component'
import { GoogleCallbackComponent } from './routes/google-callback/google-callback.component'
import { MobileVideoPlayerComponent } from './routes/mobile-video-player/mobile-video-player.component'
import { MobileProfileDashboardComponent } from './routes/profile-view/mobile-profile-dashboard/mobile-profile-dashboard.component'
import { MobileAboutPopupComponent } from './routes/mobile-about-popup/mobile-about-popup.component'
import { EducationListComponent } from './routes/profile-view/education-list/education-list.component'
import { EducationEditComponent } from './routes/profile-view/education-edit/education-edit.component'
import { WorkInfoListComponent } from './routes/profile-view/work-info-list/work-info-list.component'
import { WorkInfoEditComponent } from './routes/profile-view/work-info-edit/work-info-edit.component'
import { PersonalDetailEditComponent } from './routes/profile-view/personal-detail-edit/personal-detail-edit.component'
// 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
// Please declare routes in alphabetical order
// 😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵
const routes: Routes = [
  {
    path: '',
    redirectTo: 'public/home',
    pathMatch: 'full',
  },
  {
    path: 'public/home',
    component: PublicHomeComponent,
    data: {
      pageType: 'public',
      pageKey: 'id',
      isPublic: true,
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'practice/behavioral',
    pathMatch: 'full',
    redirectTo: 'page/embed-behavioural-skills',
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/activities',
    loadChildren: () => import('./routes/route-activities.module').then(u => u.RouteActivitiesModule),
    canActivate: [GeneralGuard],
  },

  {
    path: 'admin',
    data: {
      requiredRoles: ['register-admin', 'admin', 'content-assignment-admin'],
    },
    loadChildren: () => import('./routes/route-admin.module').then(u => u.RouteAdminModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'analytics',
    loadChildren: () => import('./routes/route-analytics.module').then(u => u.RouteAnalyticsModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/channels',
    loadChildren: () => import('./routes/route-channels.module').then(u => u.RouteChannelsModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/content-assignment',
    loadChildren: () =>
      import('./routes/route-content-assignment.module').then(u => u.RouteContentAssignmentModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/gamification',
    loadChildren: () =>
      import('./routes/route-gamification.module').then(u => u.RouteGamificationModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/setup',
    loadChildren: () => import('./routes/route-app-setup.module').then(u => u.RouteAppSetupModule),
  },
  {
    path: 'app/feedback',
    loadChildren: () =>
      import('./routes/route-feedback-v2.module').then(u => u.RouteFeedbackV2Module),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/features',
    component: FeaturesComponent,
    canActivate: [GeneralGuard],
  },

  {
    path: 'app/goals',
    loadChildren: () => import('./routes/route-goals-app.module').then(u => u.RouteGoalsAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/infy',
    loadChildren: () => import('./routes/route-infy-app.module').then(u => u.RouteInfyAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/info',
    loadChildren: () => import('./routes/route-info-app.module').then(u => u.RouteInfoAppModule),
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
    path: 'app/my-learning',
    loadChildren: () =>
      import('./routes/route-my-learning.module').then(u => u.RouteMyLearningModule),
    canActivate: [GeneralGuard, LearningGuard],
  },
  {
    path: 'app/my-dashboard',
    loadChildren: () =>
      import('./routes/route-my-dashboard.module').then(u => u.RouteMyDashboardModule),
    canActivate: [GeneralGuard, LearningGuard],
  },
  {
    path: 'app/my-rewards',
    loadChildren: () =>
      import('./routes/route-my-rewards.module').then(u => u.RouteMyRewarddModule),
    canActivate: [GeneralGuard, LearningGuard],
  },
  {
    path: 'app/notifications',
    loadChildren: () =>
      import('./routes/route-notification-app.module').then(u => u.RouteNotificationAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/org-details',
    component: OrgComponent,
    resolve: {
      orgData: OrgServiceService,
    },
  },
  {
    path: 'app/playlist',
    loadChildren: () =>
      import('./routes/route-playlist-app.module').then(u => u.RoutePlaylistAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/profile',
    loadChildren: () =>
      import('./routes/route-profile-app.module').then(u => u.RouteProfileAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/person-profile',
    loadChildren: () =>
      import('./routes/route-person-profile.module').then(u => u.RoutePersonProfileModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/events',
    loadChildren: () => import('./routes/route-app-event.module').then(m => m.AppEventsModule),
    canActivate: [GeneralGuard],
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
    // canActivate: [EmptyRouteGuard],
  },
  {
    path: 'app/social',
    loadChildren: () =>
      import('./routes/route-social-app.module').then(u => u.RouteSocialAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/signup',
    loadChildren: () =>
      import('./routes/signup/signup.module').then(u => u.SignupModule),
  },
  {
    path: 'app/login',
    component: loginComponent,
  },
  {
    path: 'app/mobile-otp',
    component: LoginOtpComponent,
  },
  {
    path: 'app/email-otp',
    component: LoginOtpComponent,
  },
  {
    path: 'app/create-account',
    component: CreateAccountComponent,
  },
  {
    path: 'app/about-you',
    component: AboutYou,
  },
  {
    path: 'app/video-player',
    component: MobileVideoPlayerComponent,
  },
  {
    path: 'app/profile-view',
    component: MobileProfileDashboardComponent,
    canActivate: [GeneralGuard],
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
    path: 'app/workinfo-list',
    component: WorkInfoListComponent,
  },
  {
    path: 'app/workinfo-edit',
    component: WorkInfoEditComponent,
  },
  {
    path: 'app/personal-detail-edit',
    component: PersonalDetailEditComponent,
  },
  {
    path: 'app/new-tnc',
    component: NewTncComponent,
    resolve: {
      tnc: TncPublicResolverService,
    },
  },
  {
    path: 'app/complete-profile',
    component: CompleteProfileComponent,
  },
  {
    path: 'app/toc',
    loadChildren: () => import('./routes/route-app-toc.module').then(u => u.RouteAppTocModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'author/toc',
    loadChildren: () => import('./routes/route-app-toc.module').then(u => u.RouteAppTocModule),
    canActivate: [GeneralGuard],
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
    path: 'app/tnc',
    component: TncComponent,
    resolve: {
      tnc: TncAppResolverService,
    },
  },
  {
    path: 'app/user-profile',
    loadChildren: () =>
      import('./routes/route-user-profile-app.module').then(u => u.RouteUserProfileAppModule),
  },
  {
    path: 'author',
    data: {
      requiredRoles: [
        'content-creator',
        'ka-creator',
        'kb-creator',
        'channel-creator',
        'reviewer',
        'publisher',
        'editor',
        'admin',
      ],
    },
    canActivate: [GeneralGuard],
    loadChildren: () =>
      import('./routes/route-authoring-app.module').then(u => u.AuthoringAppModule),
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
  { path: 'home', redirectTo: 'page/home', pathMatch: 'full' },
  { path: 'resources', redirectTo: 'page/home', pathMatch: 'full' },
  {
    path: 'learning-hub',
    loadChildren: () =>
      import('./routes/route-learning-hub-app.module').then(u => u.LearningHubAppModule),
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
    path: 'certs',
    loadChildren: () => import('./routes/route-cert.module').then(u => u.RouteCertificateModule),
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
  {
    path: 'page/explore/:tags',
    data: {
      pageType: 'page',
      pageKey: 'catalog-details',
    },
    resolve: {
      pageData: ExploreDetailResolve,
    },
    component: PageComponent,
    // canActivate: [GeneralGuard],
  },
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
  {
    path: 'public/mobile-app',
    component: MobileAppHomeComponent,
    data: {
      pageType: 'feature',
      pageKey: 'mobile-app',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'public/tnc',
    component: TncComponent,
    data: {
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
    ]
  },
  {
    path: 'public/faq/:tab',
    component: PublicFaqComponent,
  },
  {
    path: 'google/callback',
    component: GoogleCallbackComponent,
  },
  {
    path: 'viewer',
    data: {
      topBar: ETopBar.NONE,
    },
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'author/viewer',
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
    canActivate: [GeneralGuard],
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
    path: 'aboutpoppage',
    component: MobileAboutPopupComponent,
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
export class AppRoutingModule { }


import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatTabsModule } from '@angular/material/tabs'
import { BtnPageBackModule, UserImageModule } from '@ws-widget/collection'
import { HorizontalScrollerModule, PipeSafeSanitizerModule, PipeDurationTransformModule, RetainScrollModule } from '@ws-widget/utils'
import { PublicHomeComponent } from './public-home.component'
import { WidgetResolverModule } from '@ws-widget/resolver/src/public-api'
import { MobilePageComponent } from '../../../routes/mobile-page/mobile-page.component'
import { MobileHomeComponent } from '../../../routes/mobile-home/mobile-home.component'
import { MobileTrustedByPageComponent } from '../../../routes/mobile-trusted-by-page/mobile-trusted-by-page.component'
import { MatProgressBarModule } from '@angular/material/progress-bar'

import { MobilePageFaqComponent } from '../../../routes/mobile-page-faq/mobile-page-faq.component'
import { MobileLatestCommentComponent } from '../../../routes/mobile-latest-comment/mobile-latest-comment.component'
import { MobileTestimonialsComponent } from '../../../routes/mobile-testimonials/mobile-testimonials.component'

import { MobileCourseViewComponent } from '../../mobile-course-view/mobile-course-view.component'
import { MobileHowDoesWorkComponent } from '../../mobile-how-does-work/mobile-how-does-work.component'
import { MobileOrganizationComponent } from '../../mobile-organization/mobile-organization.component'
// import { MobileLeaderboardComponent } from '../../mobile-leaderboard/mobile-leaderboard.component'
import { PublicTocComponent } from '../public-toc/public-toc.component'
import { PublicTocBannerComponent } from '../public-toc-banner/public-toc-banner.component'
import { PublicTocOverviewComponent } from '../public-toc-overview/public-toc-overview.component'
import { PublicLicenseComponent } from '../public-license/public-license.component'
import { KeycloakCallbackComponent } from '../keycloak-callback/keycloak-callback.component'
import { WebHomeComponent } from '../../../routes/web-home/web-home.component'
import { WebEkshamataPublicComponent } from '../../web-ekshamata-public-container/web-ekshamata-public-container.component'

@NgModule({
  declarations: [
    PublicHomeComponent,
    WebEkshamataPublicComponent,
    MobilePageComponent,
    MobileHomeComponent,
    MobileTrustedByPageComponent,
    MobilePageFaqComponent,
    MobileLatestCommentComponent,
    MobileTestimonialsComponent,
    MobileCourseViewComponent,
    MobileHowDoesWorkComponent,
    MobileOrganizationComponent,
    // MobileLeaderboardComponent,
    PublicTocComponent,
    PublicTocBannerComponent,
    PublicTocOverviewComponent,
    PublicLicenseComponent,
    KeycloakCallbackComponent,
    WebHomeComponent,

  ],
  imports: [
    MatProgressBarModule,
    CommonModule,
    MatToolbarModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    BtnPageBackModule,
    MatButtonModule,
    HorizontalScrollerModule,
    PipeSafeSanitizerModule,
    WidgetResolverModule,
    PipeDurationTransformModule,
    RouterModule,
    UserImageModule,
    RetainScrollModule,
  ],

  exports: [PublicHomeComponent,
    MobilePageComponent,
    MobileHomeComponent,
    MobileTrustedByPageComponent,
    MobilePageFaqComponent,
    MobileLatestCommentComponent,
    MobileTestimonialsComponent,
    MobileCourseViewComponent,
    MobileHowDoesWorkComponent,
    PublicTocComponent,
    PublicTocBannerComponent,
    PublicTocOverviewComponent,
    KeycloakCallbackComponent],
})
export class PublicHomeModule { }

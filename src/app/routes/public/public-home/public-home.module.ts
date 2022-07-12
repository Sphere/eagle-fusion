
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import {
  MatToolbarModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatCardModule,
  MatButtonModule,
  MatTabsModule
} from '@angular/material'
import { BtnPageBackModule, UserImageModule } from '@ws-widget/collection'
import { HorizontalScrollerModule, PipeSafeSanitizerModule, PipeDurationTransformModule, RetainScrollModule } from '@ws-widget/utils'
import { PublicHomeComponent } from './public-home.component'
import { WidgetResolverModule } from '@ws-widget/resolver/src/public-api'
import { MobilePageComponent } from '../../../routes/mobile-page/mobile-page.component'
import { MobileHomeComponent } from '../../../routes/mobile-home/mobile-home.component'
import { MobilePageFaqComponent } from '../../../routes/mobile-page-faq/mobile-page-faq.component'
import { MobileCourseViewComponent } from '../../mobile-course-view/mobile-course-view.component'
import { MobileHowDoesWorkComponent } from '../../mobile-how-does-work/mobile-how-does-work.component'
import { MobileOrganizationComponent } from '../../mobile-organization/mobile-organization.component'
import { MobileLeaderboardComponent } from '../../mobile-leaderboard/mobile-leaderboard.component'
import { PublicTocComponent } from '../public-toc/public-toc.component'
import { PublicTocBannerComponent } from '../public-toc-banner/public-toc-banner.component'
import { PublicTocOverviewComponent } from '../public-toc-overview/public-toc-overview.component'
import { PublicLicenseComponent } from '../public-license/public-license.component'

@NgModule({
  declarations: [
    PublicHomeComponent,
    MobilePageComponent,
    MobileHomeComponent,
    MobilePageFaqComponent,
    MobileCourseViewComponent,
    MobileHowDoesWorkComponent,
    MobileOrganizationComponent,
    MobileLeaderboardComponent,
    PublicTocComponent,
    PublicTocBannerComponent,
    PublicTocOverviewComponent,
    PublicLicenseComponent,

  ],
  imports: [
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
    RetainScrollModule
  ],

  exports: [PublicHomeComponent,
    MobilePageComponent,
    MobileHomeComponent,
    MobilePageFaqComponent,
    MobileCourseViewComponent,
    MobileHowDoesWorkComponent,
    PublicTocComponent,
    PublicTocBannerComponent,
    PublicTocOverviewComponent],
})
export class PublicHomeModule { }

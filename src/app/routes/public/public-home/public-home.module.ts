
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  MatToolbarModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatCardModule,
  MatButtonModule,
} from '@angular/material'
import { BtnPageBackModule } from '@ws-widget/collection'
import { HorizontalScrollerModule, PipeSafeSanitizerModule } from '@ws-widget/utils'
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
    PublicTocComponent
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    BtnPageBackModule,
    MatButtonModule,
    HorizontalScrollerModule,
    PipeSafeSanitizerModule,
    WidgetResolverModule,
  ],

  exports: [PublicHomeComponent,
    MobilePageComponent,
    MobileHomeComponent,
    MobilePageFaqComponent,
    MobileCourseViewComponent,
    MobileHowDoesWorkComponent,
    PublicTocComponent],
})
export class PublicHomeModule { }

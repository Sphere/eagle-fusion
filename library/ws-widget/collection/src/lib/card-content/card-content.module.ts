import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule, MatIconModule, MatMenuModule, MatTooltipModule } from '@angular/material'
import { RouterModule } from '@angular/router'
import { DefaultThumbnailModule, PipeCountTransformModule, PipeDurationTransformModule, PipeHtmlTagRemovalModule, PipePartialContentModule } from '@ws-widget/utils'
import { BtnChannelAnalyticsModule } from '../btn-channel-analytics/btn-channel-analytics.module'
import { BtnContentDownloadModule } from '../btn-content-download/btn-content-download.module'
import { BtnContentFeedbackV2Module } from '../btn-content-feedback-v2/btn-content-feedback-v2.module'
import { BtnContentLikeModule } from '../btn-content-like/btn-content-like.module'
import { BtnContentMailMeModule } from '../btn-content-mail-me/btn-content-mail-me.module'
import { BtnContentShareModule } from '../btn-content-share/btn-content-share.module'
import { BtnFollowModule } from '../btn-follow/btn-follow.module'
import { BtnGoalsModule } from '../btn-goals/btn-goals.module'
import { BtnKbModule } from '../btn-kb/btn-kb.module'
import { BtnPlaylistModule } from '../btn-playlist/btn-playlist.module'
import { ContentProgressModule } from '../_common/content-progress/content-progress.module'
import { DisplayContentTypeModule } from '../_common/display-content-type/display-content-type.module'
import { PipeContentRouteModule } from '../_common/pipe-content-route/pipe-content-route.module'
import { ProfileImageModule } from '../_common/profile-image/profile-image.module'
import { UserImageModule } from '../_common/user-image/user-image.module'
import { CardContentComponent } from './card-content.component'
import { BtnKbAnalyticsModule } from '../btn-kb-analytics/btn-kb-analytics.module'
import { MdePopoverModule } from '@material-extended/mde'

@NgModule({
  declarations: [CardContentComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatChipsModule,
    MatDividerModule,
    DefaultThumbnailModule,
    DisplayContentTypeModule,
    PipeDurationTransformModule,
    PipePartialContentModule,
    PipeContentRouteModule,
    PipeCountTransformModule,
    PipeHtmlTagRemovalModule,
    ContentProgressModule,
    BtnKbModule,
    BtnContentDownloadModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    BtnContentMailMeModule,
    BtnFollowModule,
    UserImageModule,
    BtnChannelAnalyticsModule,
    ProfileImageModule,
    BtnContentFeedbackV2Module,
    BtnKbAnalyticsModule,
    MdePopoverModule,
  ],
  entryComponents: [CardContentComponent],
  exports: [CardContentComponent],
})
export class CardContentModule { }

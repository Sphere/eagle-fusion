import { NsWidgetResolver } from '@ws-widget/resolver'
// Components
import { BtnAppsComponent } from './btn-apps/btn-apps.component'
// Modules
import { BtnAppsModule } from './btn-apps/btn-apps.module'
import { BtnContentShareComponent } from './btn-content-share/btn-content-share.component'
import { BtnContentShareModule } from './btn-content-share/btn-content-share.module'
import { BtnFeatureComponent } from './btn-feature/btn-feature.component'
import { BtnFeatureModule } from './btn-feature/btn-feature.module'
import { BtnFullscreenComponent } from './btn-fullscreen/btn-fullscreen.component'
import { BtnFullscreenModule } from './btn-fullscreen/btn-fullscreen.module'
import { BtnPageBackComponent } from './btn-page-back/btn-page-back.component'
import { BtnPageBackModule } from './btn-page-back/btn-page-back.module'
import { BtnProfileComponent } from './btn-profile/btn-profile.component'
import { BtnProfileModule } from './btn-profile/btn-profile.module'
import { BtnSettingsComponent } from './btn-settings/btn-settings.component'
import { BtnSettingsModule } from './btn-settings/btn-settings.module'
import { CardContentComponent } from './card-content/card-content.component'
import { CardContentModule } from './card-content/card-content.module'
import { ROOT_WIDGET_CONFIG } from './collection.config'
import { ContentStripMultipleComponent } from './content-strip-multiple/content-strip-multiple.component'
import { ContentStripMultipleModule } from './content-strip-multiple/content-strip-multiple.module'
import { DiscussionForumComponent } from './discussion-forum/components/discussion-forum/discussion-forum.component'
import { DiscussionForumModule } from './discussion-forum/discussion-forum.module'
import { ErrorResolverComponent } from './error-resolver/error-resolver.component'
import { ErrorResolverModule } from './error-resolver/error-resolver.module'
import { GridLayoutComponent } from './grid-layout/grid-layout.component'
import { GridLayoutModule } from './grid-layout/grid-layout.module'
import { PageComponent } from './page/page.component'
import { PageModule } from './page/page.module'
import { PlayerAudioComponent } from './player-audio/player-audio.component'
import { PlayerAudioModule } from './player-audio/player-audio.module'
import { PlayerPdfComponent } from './player-pdf/player-pdf.component'
import { PlayerPdfModule } from './player-pdf/player-pdf.module'
import { PlayerVideoComponent } from './player-video/player-video.component'
import { PlayerVideoModule } from './player-video/player-video.module'
import { PlayerYoutubeComponent } from './player-youtube/player-youtube.component'
import { PlayerYoutubeModule } from './player-youtube/player-youtube.module'
import { SlidersComponent } from './sliders/sliders.component'
import { SlidersModule } from './sliders/sliders.module'

export const WIDGET_REGISTERED_MODULES = [
  BtnAppsModule,
  BtnContentShareModule,
  BtnFeatureModule,
  BtnFullscreenModule,
  BtnPageBackModule,
  BtnProfileModule,
  BtnSettingsModule,
  CardContentModule,
  ContentStripMultipleModule,
  PlayerAudioModule,
  PlayerPdfModule,
  PlayerVideoModule,
  PlayerYoutubeModule,
  SlidersModule,
  PageModule,
  DiscussionForumModule,
  GridLayoutModule,
  ErrorResolverModule,
  BtnFeatureModule,
]

export const WIDGET_REGISTRATION_CONFIG: NsWidgetResolver.IRegistrationConfig[] = [
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.apps,
    component: BtnAppsComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.contentShare,
    component: BtnContentShareComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.fullscreen,
    component: BtnFullscreenComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.pageBack,
    component: BtnPageBackComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.newProfile,
    component: BtnProfileComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.setting,
    component: BtnSettingsComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.card._type,
    widgetSubType: ROOT_WIDGET_CONFIG.card.content,
    component: CardContentComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.contentStrip._type,
    widgetSubType: ROOT_WIDGET_CONFIG.contentStrip.multiStrip,
    component: ContentStripMultipleComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.audio,
    component: PlayerAudioComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.pdf,
    component: PlayerPdfComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.video,
    component: PlayerVideoComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.player._type,
    widgetSubType: ROOT_WIDGET_CONFIG.player.youtube,
    component: PlayerYoutubeComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.slider._type,
    widgetSubType: ROOT_WIDGET_CONFIG.slider.carousel,
    component: SlidersComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.page._type,
    widgetSubType: ROOT_WIDGET_CONFIG.page.standard,
    component: PageComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.discussionForum._type,
    widgetSubType: ROOT_WIDGET_CONFIG.discussionForum.discussionForum,
    component: DiscussionForumComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.layout._type,
    widgetSubType: ROOT_WIDGET_CONFIG.layout.grid,
    component: GridLayoutComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    component: ErrorResolverComponent,
  },
  {
    widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
    widgetSubType: ROOT_WIDGET_CONFIG.actionButton.feature,
    component: BtnFeatureComponent,
  }
]

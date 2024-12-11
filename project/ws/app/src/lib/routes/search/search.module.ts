import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatOptionModule } from '@angular/material/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRippleModule } from '@angular/material/core'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatDividerModule } from '@angular/material/divider'

import {
  // BtnChannelAnalyticsModule,
  // BtnContentDownloadModule,
  // BtnContentLikeModule,
  // BtnContentMailMeModule,
  BtnContentShareModule,
  // BtnGoalsModule,
  // BtnKbModule,
  BtnPageBackModule,
  // BtnPlaylistModule,
  DisplayContentTypeModule,
  PipeContentRouteModule,
  // BtnKbAnalyticsModule,
  UserAutocompleteModule,
} from '@ws-widget/collection'
import { WidgetResolverModule } from '@ws-widget/resolver'
import {
  DefaultThumbnailModule,
  HorizontalScrollerModule, PipeDurationTransformModule, PipeLimitToModule, PipePartialContentModule,
} from '@ws-widget/utils/src/public-api'
// import { TrainingApiService } from '../infy/routes/training/apis/training-api.service'
// import { TrainingService } from '../infy/routes/training/services/training.service'
// import { BlogsCardComponent } from './components/blogs-card/blogs-card.component'
import { FilterDisplayComponent } from './components/filter-display/filter-display.component'
// import { ItemTileComponent } from './components/item-tile/item-tile.component'
import { LearningCardComponent } from './components/learning-card/learning-card.component'
// import { QandaCardComponent } from './components/qanda-card/qanda-card.component'
import { SearchInputComponent } from './components/search-input/search-input.component'
import { HomeComponent } from './routes/home/home.component'
// import { KnowledgeComponent } from './routes/knowledge/knowledge.component'
import { LearningComponent } from './routes/learning/learning.component'
import { ViewAllComponent } from './routes/view-all/view-all.component'

// import { ProjectComponent } from './routes/project/project.component'
import { SearchRootComponent } from './routes/search-root/search-root.component'
// import { SocialComponent } from './routes/social/social.component'
import { SearchRoutingModule } from './search-routing.module'
// import { PeopleComponent } from './routes/people/people.component'
import { SearchInputHomeComponent } from './components/search-input-home/search-input-home.component'
import { PublicHomeModule } from '../../../../../../../src/app/routes/public/public-home/public-home.module'
@NgModule({
  declarations: [
    SearchRootComponent,
    SearchInputComponent,
    SearchInputHomeComponent,
    LearningComponent,
    ViewAllComponent,
    // BlogsCardComponent,
    FilterDisplayComponent,
    // ItemTileComponent,
    // KnowledgeComponent,
    LearningCardComponent,
    // ProjectComponent,
    // QandaCardComponent,
    // SocialComponent,
    HomeComponent,
    // PeopleComponent,
  ],
  imports: [
    CommonModule,
    SearchRoutingModule,
    BtnPageBackModule,
    MatToolbarModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatCardModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatRippleModule,
    DefaultThumbnailModule,
    MatTooltipModule,
    PipeContentRouteModule,
    PipeLimitToModule,
    PipeDurationTransformModule,
    // BtnContentDownloadModule,
    // BtnContentLikeModule,
    BtnContentShareModule,
    // BtnPlaylistModule,
    // BtnGoalsModule,
    // BtnContentMailMeModule,
    // BtnKbAnalyticsModule,
    PipePartialContentModule,
    HorizontalScrollerModule,
    MatProgressSpinnerModule,
    DisplayContentTypeModule,
    WidgetResolverModule,
    // BtnKbModule,
    // BtnChannelAnalyticsModule,
    MatDividerModule,
    UserAutocompleteModule,
    PublicHomeModule,
  ],
  exports: [
    // ItemTileComponent,
    SearchInputComponent, SearchInputHomeComponent],
  providers: [
    // TrainingApiService, TrainingService
  ],
})
export class SearchModule { }

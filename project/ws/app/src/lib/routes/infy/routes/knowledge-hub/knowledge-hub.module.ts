import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { KnowledgeHubRoutingModule } from './knowledge-hub-routing.module'
import { KhubHomeComponent } from './routes/khub-home/khub-home.component'
import { KhubViewComponent } from './routes/khub-view/khub-view.component'
import { BtnPageBackModule, ErrorResolverModule, BtnContentShareModule } from '@ws-widget/collection'
import {
  MatIconModule,
  MatToolbarModule,
  MatTooltipModule,
  MatCardModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatOptionModule,
  MatFormFieldModule,
  MatDividerModule,
  MatProgressSpinnerModule,
  MatButtonModule,
} from '@angular/material'
import { ItemsListComponent } from './components/items-list/items-list.component'
import { ProjectSnapshotComponent } from './components/project-snapshot/project-snapshot.component'
import { TopicTaggerComponent } from './components/topic-tagger/topic-tagger.component'
import { SearchModule } from '../../../search/search.module'
import { HorizontalScrollerModule, PipeLimitToModule } from '@ws-widget/utils'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { AppTocModule } from '../../../app-toc/app-toc.module'

@NgModule({
  declarations: [
    KhubHomeComponent,
    KhubViewComponent,
    ItemsListComponent,
    ProjectSnapshotComponent,
    TopicTaggerComponent,
  ],
  imports: [
    CommonModule,
    KnowledgeHubRoutingModule,
    BtnPageBackModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    SearchModule,
    HorizontalScrollerModule,
    MatCardModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatFormFieldModule,
    PipeLimitToModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ErrorResolverModule,
    WidgetResolverModule,
    BtnContentShareModule,
    AppTocModule,
  ],
})
export class KnowledgeHubModule { }

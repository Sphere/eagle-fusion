import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table'
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'

import { ResourceCollectionRoutingModule } from './resource-collection-routing.module'
import { ResourceCollectionComponent } from './resource-collection.component'

import { WebModuleModule as PluginWebModuleModule } from '../../plugins/web-module/web-module.module'
import { ResourceCollectionModule as PluginResourceCollectionModule } from '../../plugins/resource-collection/resource-collection.module'
import {
  // BtnContentDownloadModule,
  // BtnContentFeedbackModule,
  // BtnContentLikeModule,
  BtnContentShareModule,
  // BtnGoalsModule,
  // BtnPlaylistModule,
  DisplayContentTypeModule,
  UserImageModule,
  // UserContentRatingModule,
  // BtnContentFeedbackV2Module,
  // PlayerBriefModule,
} from '@ws-widget/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@ws-widget/utils'

import { WidgetResolverModule } from '@ws-widget/resolver'

@NgModule({
  declarations: [ResourceCollectionComponent],
  imports: [
    CommonModule,
    ResourceCollectionRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatPaginatorModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    PluginResourceCollectionModule,
    PluginWebModuleModule,
    // BtnContentDownloadModule,
    // BtnContentFeedbackModule,
    // BtnContentLikeModule,
    BtnContentShareModule,
    // BtnGoalsModule,
    // BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    // UserContentRatingModule,
    // BtnContentFeedbackV2Module,
    // PlayerBriefModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    WidgetResolverModule,
  ],
  exports: [
    ResourceCollectionComponent,
  ],
})
export class ResourceCollectionModule { }

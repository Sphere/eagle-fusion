import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatProgressBarModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material'
import {
  BtnPageBackModule,
  BtnPlaylistModule,
  DisplayContentsModule,
  DisplayContentTypeModule,
  PickerContentModule,
  TourModule,
  // EmailInputModule,
  TreeCatalogModule,
  UserAutocompleteModule,
  UserImageModule,
  ContentPickerV2Module,
} from '@ws-widget/collection'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { DefaultThumbnailModule, PipeDurationTransformModule } from '@ws-widget/utils'
import { PlaylistCardComponent } from './components/playlist-card/playlist-card.component'
import { PlaylistContentDeleteDialogComponent } from './components/playlist-content-delete-dialog/playlist-content-delete-dialog.component'
import { PlaylistContentDeleteErrorDialogComponent } from './components/playlist-content-delete-error-dialog/playlist-content-delete-error-dialog.component'
import { PlaylistDeleteDialogComponent } from './components/playlist-delete-dialog/playlist-delete-dialog.component'
import { PlaylistShareDialogComponent } from './components/playlist-share-dialog/playlist-share-dialog.component'
import { FilterPlaylistPipe } from './pipes/filter-playlist.pipe'
import { PlaylistRoutingModule } from './playlist-routing.module'
import { PlaylistCreateComponent } from './routes/playlist-create/playlist-create.component'
import { PlaylistDetailComponent } from './routes/playlist-detail/playlist-detail.component'
import { PlaylistEditComponent } from './routes/playlist-edit/playlist-edit.component'
import { PlaylistHomeComponent } from './routes/playlist-home/playlist-home.component'
import { PlaylistNotificationComponent } from './routes/playlist-notification/playlist-notification.component'
import { DragDropModule } from '@angular/cdk/drag-drop'
@NgModule({
  declarations: [
    PlaylistCardComponent,
    PlaylistContentDeleteDialogComponent,
    PlaylistDeleteDialogComponent,
    PlaylistHomeComponent,
    PlaylistEditComponent,
    PlaylistNotificationComponent,
    PlaylistDetailComponent,
    FilterPlaylistPipe,
    PlaylistCreateComponent,
    PlaylistShareDialogComponent,
    PlaylistContentDeleteErrorDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PlaylistRoutingModule,
    BtnPlaylistModule,
    BtnPageBackModule,
    WidgetResolverModule,
    DisplayContentTypeModule,
    PickerContentModule,
    PipeDurationTransformModule,
    DragDropModule,
    // EmailInputModule,
    TreeCatalogModule,
    DefaultThumbnailModule,
    DisplayContentsModule,
    UserImageModule,
    UserAutocompleteModule,
    TourModule,
    ContentPickerV2Module,
    // material imports
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    MatRippleModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDialogModule,
    MatCardModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  entryComponents: [
    PlaylistContentDeleteDialogComponent,
    PlaylistContentDeleteErrorDialogComponent,
    PlaylistDeleteDialogComponent,
    PlaylistShareDialogComponent,
  ],
})
export class PlaylistModule { }

import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import {
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material'
import { RouterModule } from '@angular/router'
import { BtnPageBackModule, BtnSocialLikeModule } from '@ws-widget/collection'
import { ForumViewComponent } from './components/forum-view.component'

@NgModule({
  declarations: [ForumViewComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,

    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    BtnPageBackModule,
    BtnSocialLikeModule,

    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatChipsModule,
    MatFormFieldModule,
    MatTooltipModule,

  ],

  exports: [ForumViewComponent],
})
export class ForumViewModule { }

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PostViewComponent } from './post-view.component'
import {
  MatToolbarModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatMenuModule,
  MatChipsModule,
  MatExpansionModule,
  MatDividerModule,
  MatButtonModule,
} from '@angular/material'
import { RouterModule } from '@angular/router'
import {
  UserImageModule,
  BtnSocialLikeModule,
  BtnSocialVoteModule,
  EditorQuillModule,
  BtnPageBackModule,
} from '@ws-widget/collection'
import { PipeSafeSanitizerModule } from '@ws-widget/utils'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { BlogsReplyModule } from '../../blogs/blogs-reply/blogs-reply.module'
@NgModule({
  declarations: [PostViewComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    RouterModule,
    UserImageModule,
    MatChipsModule,
    MatExpansionModule,
    PipeSafeSanitizerModule,
    MatDividerModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,

    BlogsReplyModule,
    BtnSocialLikeModule,
    BtnSocialVoteModule,
    EditorQuillModule,
    BtnPageBackModule,
  ],
  exports: [PostViewComponent],
})
export class PostViewModule { }

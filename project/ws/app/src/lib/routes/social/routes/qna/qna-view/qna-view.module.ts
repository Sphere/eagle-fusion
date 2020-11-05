import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { WidgetResolverModule } from '@ws-widget/resolver'
import {
  MatButtonModule,
  MatDividerModule,
  MatToolbarModule,
  MatIconModule,
  MatChipsModule,
  MatTooltipModule,
  MatProgressSpinnerModule,
  MatCardModule,
  MatFormFieldModule,
  MatAutocompleteModule,
  MatMenuModule,
  MatInputModule,
} from '@angular/material'
import {
  BtnPageBackModule,
  EditorQuillModule,
  BtnSocialVoteModule,
  BtnSocialLikeModule,
  UserImageModule,
} from '@ws-widget/collection'
import { PipeLimitToModule, PipeSafeSanitizerModule } from '@ws-widget/utils'

import { QnaViewComponent } from './components/qna-view/qna-view.component'
import { QnaReplyComponent } from './components/qna-reply/qna-reply.component'

@NgModule({
  declarations: [QnaViewComponent, QnaReplyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    WidgetResolverModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    BtnPageBackModule,
    BtnSocialVoteModule,
    BtnSocialLikeModule,
    EditorQuillModule,
    UserImageModule,
    PipeLimitToModule,
    PipeSafeSanitizerModule,
  ],
})
export class QnaViewModule { }

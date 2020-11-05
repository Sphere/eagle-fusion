import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatCardModule, MatDividerModule, MatIconModule, MatButtonModule } from '@angular/material'
import { RouterModule } from '@angular/router'
import { BtnSocialVoteModule, BtnSocialLikeModule } from '../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { ForumPostViewComponent } from './components/forum-post-view.component'
import { ForumCardModule } from '../forum-card/forum-card.module'

@NgModule({
  declarations: [ForumPostViewComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    BtnSocialVoteModule,
    BtnSocialLikeModule,
    RouterModule,
    ForumCardModule,
  ],
  exports: [ForumPostViewComponent],
})
export class ForumPostViewModule { }

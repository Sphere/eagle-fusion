import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatCardModule, MatDividerModule, MatIconModule } from '@angular/material'
import { RouterModule } from '@angular/router'
import { BtnSocialVoteModule, BtnSocialLikeModule } from '../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { ForumCardComponent } from './forum-card.component'
import { BtnFlagModule } from '../widgets/buttons/btn-flag/btn-flag.module'
import { BtnFlagComponent } from '../widgets/buttons/btn-flag/btn-flag.component'

@NgModule({
  declarations: [ForumCardComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
    BtnSocialVoteModule,
    BtnSocialLikeModule,
    MatDividerModule,
    BtnFlagModule,

  ],
  exports: [ForumCardComponent],
  providers: [BtnFlagComponent],
})
export class ForumCardModule { }

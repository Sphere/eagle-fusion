import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
// tslint:disable-next-line: max-line-length
import { MatButtonModule, MatCardModule, MatChipsModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatToolbarModule } from '@angular/material'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatListModule } from '@angular/material/list'
import { RouterModule } from '@angular/router'
import { BtnPageBackModule, BtnSocialLikeModule, BtnSocialVoteModule } from '@ws-widget/collection'
import { ForumCardModule } from '../forum-card/forum-card.module'
import { BtnFlagModule } from '../widgets/buttons/btn-flag/btn-flag.module'
import { RecentForumPostComponent } from './components/recent-forum-post.component'

@NgModule({
  declarations: [RecentForumPostComponent],
  imports: [

    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    BtnSocialLikeModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    BtnPageBackModule,
    BtnPageBackModule,
    BtnSocialVoteModule,
    BtnSocialLikeModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatChipsModule,
    MatFormFieldModule,
    BtnFlagModule,
    ForumCardModule,
  ],

  exports: [RecentForumPostComponent],
})
export class RecentForumPostModule {
  constructor() {
    // console.log('success in reaching recent forum post module')
  }
}

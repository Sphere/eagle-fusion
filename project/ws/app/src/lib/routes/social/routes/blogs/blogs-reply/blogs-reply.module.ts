import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BlogReplyComponent } from './components/blog-reply.component'
import { MatCardModule, MatMenuModule, MatIconModule, MatButtonModule } from '@angular/material'
import { UserImageModule, BtnSocialVoteModule, BtnSocialLikeModule, BtnPageBackModule, EditorQuillModule } from '@ws-widget/collection'
import { PipeSafeSanitizerModule } from '@ws-widget/utils'
import { BtnFlagModule } from '../../forums/widgets/buttons/btn-flag/btn-flag.module'

@NgModule({
  declarations: [BlogReplyComponent],
  imports: [
    CommonModule,
    MatCardModule,
    UserImageModule,
    MatMenuModule,
    MatIconModule,
    PipeSafeSanitizerModule,
    MatButtonModule,
    BtnFlagModule,

    BtnSocialVoteModule,
    BtnSocialLikeModule,
    BtnPageBackModule,
    EditorQuillModule,
  ],
  exports: [BlogReplyComponent],
})
export class BlogsReplyModule { }

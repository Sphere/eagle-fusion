import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnSocialLikeComponent } from './btn-social-like.component'
import { MatIconModule, MatTooltipModule, MatButtonModule, MatBadgeModule } from '@angular/material'
import { DialogSocialActivityUserModule } from '../../dialog/dialog-social-activity-user/dialog-social-activity-user.module'

@NgModule({
  declarations: [BtnSocialLikeComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatBadgeModule,
    DialogSocialActivityUserModule,
  ],
  exports: [BtnSocialLikeComponent],
})
export class BtnSocialLikeModule {}

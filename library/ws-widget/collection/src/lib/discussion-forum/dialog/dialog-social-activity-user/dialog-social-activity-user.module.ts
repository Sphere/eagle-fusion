import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DialogSocialActivityUserComponent } from './dialog-social-activity-user.component'
import {
  MatTabsModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatIconModule,
  MatDividerModule,
} from '@angular/material'
import { UserImageModule } from '../../../_common/user-image/user-image.module'

@NgModule({
  declarations: [DialogSocialActivityUserComponent],
  imports: [
    CommonModule,
    MatTabsModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    UserImageModule,
  ],
  entryComponents: [DialogSocialActivityUserComponent],
})
export class DialogSocialActivityUserModule { }

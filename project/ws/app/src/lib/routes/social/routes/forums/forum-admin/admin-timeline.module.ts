import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule, MatCardModule, MatChipsModule, MatDialogModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatListModule, MatMenuModule, MatProgressSpinnerModule, MatToolbarModule } from '@angular/material'
import { MatTabsModule } from '@angular/material/tabs'
import { RouterModule } from '@angular/router'
import { BtnPageBackModule, BtnSocialLikeModule, BtnSocialVoteModule } from '../../../../../../../../../../library/ws-widget/collection/src/public-api'
import { BtnAdminModule } from '../widgets/buttons/btn-admin/btn-admin.module'
import { BtnModeratorModule } from '../widgets/buttons/btn-moderator/btn-moderator.module'
import { DialogBoxAdminAcceptComponent } from '../widgets/Dialog-Box/dialog-box-admin-accept/dialog-box-admin-accept.component'
import { DialogBoxAdminAcceptModule } from '../widgets/Dialog-Box/dialog-box-admin-accept/dialog-box-admin-accept.module'
import { DialogBoxModeratorModule } from '../widgets/Dialog-Box/dialog-box-moderator/dialog-box-moderator.module'
import { AdminTimelineComponent } from './components/admin-timeline.component'

@NgModule({
  declarations: [AdminTimelineComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    BtnSocialLikeModule,
    BtnAdminModule,

    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTabsModule,
    BtnPageBackModule,
    BtnPageBackModule,
    BtnSocialVoteModule,
    BtnSocialLikeModule,
    DialogBoxModeratorModule,
    DialogBoxAdminAcceptModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatChipsModule,
    MatFormFieldModule,
    BtnModeratorModule,
    MatListModule,
    MatDialogModule,

  ],
  entryComponents: [DialogBoxAdminAcceptComponent],
  exports: [AdminTimelineComponent],
})
export class AdminTimelineModule { }

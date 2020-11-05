import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule, MatIconModule, MatTooltipModule } from '@angular/material'
import { MatFormFieldModule } from '@angular/material/form-field'
import { DialogBoxAdminComponent } from '../../Dialog-Box/dialog-box-admin/dialog-box-admin.component'
import { DialogBoxAdminModule } from '../../Dialog-Box/dialog-box-admin/dialog-box-admin.module'
import { DialogBoxModeratorComponent } from '../../Dialog-Box/dialog-box-moderator/dialog-box-moderator.component'
import { DialogBoxModeratorModule } from '../../Dialog-Box/dialog-box-moderator/dialog-box-moderator.module'
import { BtnModeratorComponent } from '../btn-moderator/btn-moderator.component'
import { BtnAdminComponent } from './btn-admin.component'

@NgModule({
  declarations: [BtnAdminComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    DialogBoxModeratorModule,
    DialogBoxAdminModule,
  ],
  exports: [BtnAdminComponent],
  entryComponents: [BtnModeratorComponent, DialogBoxModeratorComponent, DialogBoxAdminComponent],
})
export class BtnAdminModule { }

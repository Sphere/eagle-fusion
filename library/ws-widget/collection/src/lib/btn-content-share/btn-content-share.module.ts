import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatButtonModule,
  MatIconModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatChipsModule,
  MatDialogModule,
  MatProgressSpinnerModule,
  MatInputModule,
} from '@angular/material'

import { UserAutocompleteModule } from '../_common/user-autocomplete/user-autocomplete.module'

import { BtnContentShareComponent } from './btn-content-share.component'
import { BtnContentShareDialogComponent } from './btn-content-share-dialog/btn-content-share-dialog.component'
import { BtnLinkedinShareModule } from '../btn-linkedin-share/btn-linkedin-share.module'
import { BtnFacebookShareModule } from '../btn-facebook-share/btn-facebook-share.module'
import { BtnTwitterShareModule } from '../btn-twitter-share/btn-twitter-share.module'

@NgModule({
  declarations: [BtnContentShareComponent, BtnContentShareDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    UserAutocompleteModule,
    BtnLinkedinShareModule,
    BtnFacebookShareModule,
    BtnTwitterShareModule,
  ],
  exports: [BtnContentShareComponent],
  entryComponents: [BtnContentShareComponent, BtnContentShareDialogComponent],
})
export class BtnContentShareModule {}

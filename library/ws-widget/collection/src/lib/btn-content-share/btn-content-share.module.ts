import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'


import { UserAutocompleteModule } from '../_common/user-autocomplete/user-autocomplete.module'

import { BtnContentShareComponent } from './btn-content-share.component'
import { BtnContentShareDialogComponent } from './btn-content-share-dialog/btn-content-share-dialog.component'
import { BtnLinkedinShareModule } from '../btn-linkedin-share/btn-linkedin-share.module'
import { BtnFacebookShareModule } from '../btn-facebook-share/btn-facebook-share.module'
import { BtnTwitterShareModule } from '../btn-twitter-share/btn-twitter-share.module'
import { QRCodeModule } from 'angularx-qrcode'
import { BtnWhatsappShareModule } from '../btn-whatsapp-share/btn-whatsapp-share.module'

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
        QRCodeModule,
        BtnWhatsappShareModule,
    ],
    exports: [BtnContentShareComponent]
})
export class BtnContentShareModule { }

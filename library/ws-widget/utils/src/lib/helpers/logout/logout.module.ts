import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'

import { LogoutComponent } from './logout.component'

@NgModule({
    declarations: [LogoutComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
    ]
})
export class LogoutModule { }

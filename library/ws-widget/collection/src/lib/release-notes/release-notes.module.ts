import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'

import { BtnPageBackModule } from '../../lib/btn-page-back/btn-page-back.module'
import { ReleaseNotesComponent } from './release-notes.component'

@NgModule({
    declarations: [ReleaseNotesComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        MatToolbarModule,
        MatTooltipModule,
        MatChipsModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        BtnPageBackModule,
    ]
})
export class ReleaseNotesModule { }

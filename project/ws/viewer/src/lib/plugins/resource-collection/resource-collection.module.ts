import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'

import { ResourceCollectionComponent } from './resource-collection.component'
import { ViewSubmissionComponent } from './components/view-submission/view-submission.component'
import { PlayerPdfModule, PlayerVideoModule } from '../../../../../../../library/ws-widget/collection/src/public-api'

@NgModule({
    declarations: [ResourceCollectionComponent, ViewSubmissionComponent],
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatDialogModule,
        MatCardModule,
        MatPaginatorModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatIconModule,
        MatToolbarModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        PlayerPdfModule,
        PlayerVideoModule,
    ],
    exports: [
        ResourceCollectionComponent,
    ]
})
export class ResourceCollectionModule { }

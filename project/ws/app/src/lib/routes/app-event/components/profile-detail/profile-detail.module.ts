import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDividerModule } from '@angular/material/divider'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { ProfileDetailComponent } from './profile-detail.component'
import { RouterModule } from '@angular/router'
import { ViewUsersComponent } from './view-users/view-users.component'
import { CardDetailsModule } from '../card-details/card-details.module'
@NgModule({
    declarations: [ProfileDetailComponent, ViewUsersComponent],
    imports: [
        CommonModule,
        CardDetailsModule,
        MatIconModule,
        MatButtonModule,
        RouterModule,
        MatCardModule,
        MatDividerModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [ProfileDetailComponent]
})

export class ProfileDetailModule { }

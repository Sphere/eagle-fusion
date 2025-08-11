import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DialogSocialDeletePostComponent } from './dialog-social-delete-post.component'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'

@NgModule({
    declarations: [DialogSocialDeletePostComponent],
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule]
})
export class DialogSocialDeletePostModule { }

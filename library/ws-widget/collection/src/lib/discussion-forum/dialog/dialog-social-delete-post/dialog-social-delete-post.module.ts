import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DialogSocialDeletePostComponent } from './dialog-social-delete-post.component'
import { MatDialogModule, MatButtonModule, MatProgressSpinnerModule } from '@angular/material'

@NgModule({
  declarations: [DialogSocialDeletePostComponent],
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  entryComponents: [DialogSocialDeletePostComponent],
})
export class DialogSocialDeletePostModule {}

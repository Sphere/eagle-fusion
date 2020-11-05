import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CtrlFileUploadComponent } from './components/ctrl-file-upload/ctrl-file-upload.component'
import { MatButtonModule } from '@angular/material'

@NgModule({
  declarations: [CtrlFileUploadComponent],
  imports: [CommonModule, MatButtonModule],
  exports: [CtrlFileUploadComponent],
})
export class CtrlFileUploadModule {}

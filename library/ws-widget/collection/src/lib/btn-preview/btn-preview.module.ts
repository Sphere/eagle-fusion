import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnPreviewComponent } from './btn-preview.component'
import { BtnPreviewDialogComponent } from './btn-preview-dialog/btn-preview-dialog.component'

@NgModule({
  declarations: [BtnPreviewComponent, BtnPreviewDialogComponent],
  imports: [
    CommonModule,
  ],
  exports: [BtnPreviewComponent],
  entryComponents: [BtnPreviewComponent, BtnPreviewDialogComponent],
})
export class BtnPreviewModule { }

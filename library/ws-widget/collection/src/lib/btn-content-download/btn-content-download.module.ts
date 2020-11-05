import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnContentDownloadComponent } from './btn-content-download.component'
import { MatButtonModule, MatIconModule, MatTooltipModule } from '@angular/material'

@NgModule({
  declarations: [BtnContentDownloadComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [BtnContentDownloadComponent],
  entryComponents: [BtnContentDownloadComponent],
})
export class BtnContentDownloadModule { }

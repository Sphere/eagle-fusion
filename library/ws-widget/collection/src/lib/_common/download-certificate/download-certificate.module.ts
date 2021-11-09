import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DownloadCertificateComponent } from './download-certificate/download-certificate.component'
import { MatButtonModule, MatProgressSpinnerModule } from '@angular/material'

@NgModule({
  declarations: [DownloadCertificateComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  exports: [DownloadCertificateComponent],
})
export class DownloadCertificateModule { }

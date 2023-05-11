import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CertificateModule } from './certificate/certificate.module'

@NgModule({
  imports: [CommonModule, CertificateModule],
  exports: [CertificateModule],
})
export class RouteCertificateModule {

}

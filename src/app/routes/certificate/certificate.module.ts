import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CertificateRoutingModule } from './certificate-routing.module'
import { FormsModule } from '@angular/forms'
import { CertificateDetailsComponent } from './components/index'
import { CertificateService } from './services/certificate.service'
import { ApiService } from '@ws/author/src/public-api'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [
    CertificateDetailsComponent,
  ],
  imports: [
    CommonModule,
    CertificateRoutingModule,
    FormsModule,
    MatIconModule,
    TranslateModule,
  ],
  providers: [CertificateService, ApiService],
})
export class CertificateModule { }

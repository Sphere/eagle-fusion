import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { InfyRoutingModule } from './infy-routing.module'
import { CertificationsGuard } from './routes/certification-dashboard/guards/certifications.guard'

@NgModule({
  declarations: [],
  imports: [CommonModule, InfyRoutingModule],
  providers: [CertificationsGuard],
})
export class InfyModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CertificationComponent } from './certification.component'
import { CertificationModule as CertificationViewContainerModule } from '../../route-view-container/certification/certification.module'
import { CertificationRoutingModule } from './certification-routing.module'
import { WidgetResolverModule } from '@ws-widget/resolver'

@NgModule({
  declarations: [CertificationComponent],
  imports: [
    CommonModule,
    CertificationViewContainerModule,
    CertificationRoutingModule,
    WidgetResolverModule,
  ],
})
export class CertificationModule { }

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CertificationComponent } from './certification.component'
import { CertificationModule as CertificationPluginModule } from '../../plugins/certification/certification.module'
import { CertificationRoutingModule } from './certification-routing.module'
import { WidgetResolverModule } from '@ws-widget/resolver'

@NgModule({
  declarations: [CertificationComponent],
  imports: [
    CommonModule,
    CertificationPluginModule,
    CertificationRoutingModule,
    WidgetResolverModule,
  ],
  exports: [CertificationComponent],
})
export class CertificationModule { }

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RdbmsHandsOnComponent } from './rdbms-hands-on.component'
import { RdbmsHandsOnRoutingModule } from './rdbms-hands-on-routing.module'
import { RdbmsHandsOnModule as RdbmsHandsViewContainerOnModule } from '../../route-view-container/rdbms-hands-on/rdbms-hands-on.module'
@NgModule({
  declarations: [RdbmsHandsOnComponent],
  imports: [
    CommonModule,
    RdbmsHandsOnRoutingModule,
    RdbmsHandsViewContainerOnModule,
  ],
})
export class RdbmsHandsOnModule { }

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HandsOnComponent } from './hands-on.component'
import { HandsOnRoutingModule } from './hands-on-routing.module'
import { HandsOnModule as HandsOnViewContainerModule } from '../../route-view-container/hands-on/hands-on.module'

@NgModule({
  declarations: [HandsOnComponent],
  imports: [
    CommonModule,
    HandsOnViewContainerModule,
    HandsOnRoutingModule,
  ],
})
export class HandsOnModule { }

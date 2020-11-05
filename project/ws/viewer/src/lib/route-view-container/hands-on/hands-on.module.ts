import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HandsOnComponent } from './hands-on.component'
import { HandsOnRoutingModule } from './hands-on-routing.module'
import { HandsOnModule as HandsOnPluginModule } from '../../plugins/hands-on/hands-on.module'

@NgModule({
  declarations: [HandsOnComponent],
  imports: [
    CommonModule,
    HandsOnPluginModule,
    HandsOnRoutingModule,
  ],
  exports: [HandsOnComponent],
})
export class HandsOnModule { }

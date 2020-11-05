import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeContentRoutePipe } from './pipe-content-route.pipe'

@NgModule({
  declarations: [PipeContentRoutePipe],
  imports: [
    CommonModule,
  ],
  exports: [PipeContentRoutePipe],
})
export class PipeContentRouteModule { }

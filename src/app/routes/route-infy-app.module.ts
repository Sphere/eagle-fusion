import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { InfyModule } from '@ws/app'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    InfyModule,
  ],
  exports: [
    InfyModule,
  ],
})
export class RouteInfyAppModule { }

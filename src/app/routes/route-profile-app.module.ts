import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProfileModule } from '@ws/app'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProfileModule,
  ],
  exports: [
    ProfileModule,
  ],
})
export class RouteProfileAppModule { }

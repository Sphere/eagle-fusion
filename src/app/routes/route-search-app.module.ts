import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SearchModule } from '@ws/app'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SearchModule,
  ],
  exports: [
    SearchModule,
  ],
})
export class RouteSearchAppModule { }

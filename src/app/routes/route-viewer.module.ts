import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ViewerModule } from '@ws/viewer/src/lib/viewer.module'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ViewerModule,
  ],
})
export class RouteViewerModule { }

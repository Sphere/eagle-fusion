import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatSelectModule } from '@angular/material/select'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatToolbarModule } from '@angular/material/toolbar'
import { ViewerComponent } from './viewer.component'
import { ViewerRoutingModule } from './viewer-routing.module'

@NgModule({
  declarations: [ViewerComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatSelectModule,
    ViewerRoutingModule,
  ],
  exports: [
    ViewerComponent,
  ],
})
export class AuthViewerModule { }

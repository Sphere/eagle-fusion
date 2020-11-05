import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatCardModule, MatIconModule } from '@angular/material'
import { TourComponent } from './tour-guide.component'

@NgModule({
  declarations: [TourComponent],
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
  ],
  exports: [TourComponent],
})
export class TourModule { }

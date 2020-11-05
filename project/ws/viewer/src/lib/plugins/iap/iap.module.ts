import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IapComponent } from './iap.component'
import {
  MatCardModule,
  MatButtonModule,
} from '@angular/material'
@NgModule({
  declarations: [IapComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
  ],
  exports: [
    IapComponent,
  ],
})
export class IapModule { }

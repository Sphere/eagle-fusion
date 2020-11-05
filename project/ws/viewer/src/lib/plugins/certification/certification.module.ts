import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatCardModule,
  MatButtonModule,
} from '@angular/material'
import { CertificationComponent } from './certification.component'
@NgModule({
  declarations: [CertificationComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
  ],
  exports: [
    CertificationComponent,
  ],
})
export class CertificationModule { }

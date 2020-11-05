import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnSocialDeleteComponent } from './btn-social-delete.component'
import { MatIconModule, MatButtonModule } from '@angular/material'

@NgModule({
  declarations: [BtnSocialDeleteComponent],
  imports: [CommonModule, MatIconModule, MatButtonModule],
  exports: [BtnSocialDeleteComponent],
})
export class BtnSocialDeleteModule {}

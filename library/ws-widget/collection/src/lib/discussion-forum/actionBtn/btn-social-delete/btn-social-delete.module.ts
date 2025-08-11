import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnSocialDeleteComponent } from './btn-social-delete.component'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'

@NgModule({
  declarations: [BtnSocialDeleteComponent],
  imports: [CommonModule, MatIconModule, MatButtonModule],
  exports: [BtnSocialDeleteComponent],
})
export class BtnSocialDeleteModule { }

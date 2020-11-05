import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ContactHomeComponent } from './components/contact-home.component'
import { MatToolbarModule, MatCardModule, MatButtonModule } from '@angular/material'
import { BtnPageBackModule } from '@ws-widget/collection'

@NgModule({
  declarations: [ContactHomeComponent],
  imports: [CommonModule, MatToolbarModule, MatCardModule, BtnPageBackModule, MatButtonModule],
  exports: [ContactHomeComponent],
})
export class ContactModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PentagonComponent } from './pentagon.component'

@NgModule({
  declarations: [PentagonComponent],
  imports: [CommonModule],
  exports: [PentagonComponent],
})
export class PentagonModule {}

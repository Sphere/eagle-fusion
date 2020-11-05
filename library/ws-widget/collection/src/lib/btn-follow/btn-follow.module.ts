import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnFollowComponent } from './btn-follow.component'
import { MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule } from '@angular/material'

@NgModule({
  declarations: [BtnFollowComponent],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  exports: [BtnFollowComponent],
  entryComponents: [BtnFollowComponent],
})
export class BtnFollowModule { }

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule, MatButtonModule, MatTooltipModule, MatBadgeModule } from '@angular/material'
import { BtnContentLikeComponent } from './btn-content-like.component'

@NgModule({
  declarations: [BtnContentLikeComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  exports: [BtnContentLikeComponent],
  entryComponents: [BtnContentLikeComponent],
})
export class BtnContentLikeModule { }

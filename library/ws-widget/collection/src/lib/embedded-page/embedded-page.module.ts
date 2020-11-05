import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EmbeddedPageComponent } from './embedded-page.component'
import { MatIconModule, MatToolbarModule } from '@angular/material'
import { BtnPageBackModule } from '../btn-page-back/btn-page-back.module'

@NgModule({
  declarations: [EmbeddedPageComponent],
  imports: [CommonModule, BtnPageBackModule, MatIconModule, MatToolbarModule],
  exports: [EmbeddedPageComponent],
  entryComponents: [EmbeddedPageComponent],
})
export class EmbeddedPageModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicContactComponent } from './public-contact.component'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatExpansionModule } from '@angular/material/expansion'

import { BtnPageBackModule } from '@ws-widget/collection'
import { PipeSafeSanitizerModule } from '@ws-widget/utils'

@NgModule({
  declarations: [PublicContactComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    BtnPageBackModule,
    MatDividerModule,
    MatIconModule,
    MatExpansionModule,
    PipeSafeSanitizerModule,
  ],
  exports: [PublicContactComponent],
})
export class PublicContactModule { }

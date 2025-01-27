import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicFaqComponent } from './public-faq.component'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatListModule } from '@angular/material/list'
import { MatButtonModule } from '@angular/material/button'

import { RouterModule } from '@angular/router'
import { BtnPageBackModule } from '@ws-widget/collection'

@NgModule({
  declarations: [PublicFaqComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    RouterModule,
    BtnPageBackModule,
    MatButtonModule,
  ],
  exports: [PublicFaqComponent],
})
export class PublicFaqModule { }

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicFaqComponent } from './public-faq.component'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatDividerModule } from '@angular/material/divider'
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'

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

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'


import {
  BtnFullscreenModule,
} from '@ws-widget/collection'

import { WebModuleComponent } from './web-module.component'

@NgModule({
  declarations: [WebModuleComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatSidenavModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatInputModule,
    MatToolbarModule,
    BtnFullscreenModule,
  ],
  exports: [
    WebModuleComponent,
  ],
})
export class WebModuleModule { }

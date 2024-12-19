import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatSelectModule } from '@angular/material/select'
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

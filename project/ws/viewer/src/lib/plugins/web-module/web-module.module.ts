import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import {
  MatButtonModule,
  MatDividerModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSelectModule,
  MatSidenavModule,
  MatToolbarModule,
} from '@angular/material'

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

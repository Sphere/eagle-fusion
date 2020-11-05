import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BlogResultComponent } from './components/blog-result.component'
import { RouterModule } from '@angular/router'
import {
  MatMenuModule,
  MatIconModule,
  MatDividerModule,
  MatButtonModule,
  MatProgressSpinnerModule,
} from '@angular/material'
import { PipeSafeSanitizerModule } from '@ws-widget/utils'
import { DialogSocialDeletePostModule, BtnPageBackModule } from '@ws-widget/collection'

@NgModule({
  declarations: [BlogResultComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PipeSafeSanitizerModule,
    DialogSocialDeletePostModule,
    BtnPageBackModule,
  ],
  exports: [BlogResultComponent],
})
export class BlogsResultModule {}

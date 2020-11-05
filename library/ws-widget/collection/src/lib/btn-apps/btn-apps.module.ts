import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { BtnAppsComponent } from './btn-apps.component'
import { MatButtonModule, MatIconModule, MatMenuModule, MatRippleModule } from '@angular/material'
import { WidgetResolverModule } from '@ws-widget/resolver'

@NgModule({
  declarations: [BtnAppsComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    WidgetResolverModule,
  ],
  exports: [BtnAppsComponent],
  entryComponents: [BtnAppsComponent],
})
export class BtnAppsModule { }

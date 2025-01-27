import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { BtnAppsComponent } from './btn-apps.component'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatRippleModule } from '@angular/material/core' // MatRippleModule is part of '@angular/material/core'
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

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, MatSlideToggleModule, MatDialogModule } from '@angular/material'
import { BtnProfileComponent } from './btn-profile.component'
import { WidgetResolverModule } from '@ws-widget/resolver/src/public-api'
import { RouterModule } from '@angular/router'
import { LogoutModule } from '@ws-widget/utils'
// import { TreeCatalogModule } from '../tree-catalog/tree-catalog.module'

@NgModule({
  declarations: [BtnProfileComponent],
  imports: [
    CommonModule,
    LogoutModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatSlideToggleModule,
    RouterModule,
    WidgetResolverModule,

  ],
  entryComponents: [BtnProfileComponent],
})
export class BtnProfileModule { }

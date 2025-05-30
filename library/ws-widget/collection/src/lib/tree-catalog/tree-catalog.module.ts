import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { TreeCatalogComponent } from './tree-catalog.component'
import { TreeModule } from '../tree/tree.module'
import { TreeCatalogMenuComponent } from './tree-catalog-menu/tree-catalog-menu.component'
import { MatMenuModule } from '@angular/material/menu'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatButtonModule } from '@angular/material/button'
import { TreeCatalogRoutePipe } from './tree-catalog-route.pipe'

@NgModule({
  declarations: [TreeCatalogComponent, TreeCatalogMenuComponent, TreeCatalogRoutePipe],
  imports: [
    CommonModule,
    RouterModule,
    TreeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  exports: [TreeCatalogComponent, TreeCatalogMenuComponent],
  entryComponents: [TreeCatalogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TreeCatalogModule { }

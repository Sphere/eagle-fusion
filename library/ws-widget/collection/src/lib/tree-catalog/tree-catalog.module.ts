import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { TreeCatalogComponent } from './tree-catalog.component'
import { TreeModule } from '../tree/tree.module'
import { TreeCatalogMenuComponent } from './tree-catalog-menu/tree-catalog-menu.component'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
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
    exports: [TreeCatalogComponent, TreeCatalogMenuComponent]
})
export class TreeCatalogModule { }

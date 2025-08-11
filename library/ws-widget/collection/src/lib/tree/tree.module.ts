import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TreeComponent } from './tree.component'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatTreeModule } from '@angular/material/tree'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { RouterModule } from '@angular/router'

@NgModule({
    declarations: [TreeComponent],
    imports: [
        CommonModule,
        RouterModule,
        // Material Imports
        MatCardModule,
        MatTreeModule,
        MatIconModule,
        MatButtonModule,
    ],
    exports: [TreeComponent]
})
export class TreeModule { }

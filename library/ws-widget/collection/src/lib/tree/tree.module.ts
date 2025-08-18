import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TreeComponent } from './tree.component'
import { MatCardModule } from '@angular/material/card'
import { MatTreeModule } from '@angular/material/tree'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
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

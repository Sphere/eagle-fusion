import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TreeComponent } from './tree.component'
import { MatCardModule, MatTreeModule, MatIconModule, MatButtonModule } from '@angular/material'
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
  exports: [TreeComponent],
  entryComponents: [TreeComponent],
})
export class TreeModule { }

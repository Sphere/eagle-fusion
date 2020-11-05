import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CatalogSelectComponent } from '../catalog-select/catalog-select.component'
import { MatTreeModule } from '@angular/material/tree'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule, MatDialogModule } from '@angular/material'

@NgModule({
  declarations: [CatalogSelectComponent],
  imports: [
    CommonModule,
    MatTreeModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  exports: [CatalogSelectComponent],
  entryComponents: [CatalogSelectComponent],
})
export class CatalogSelectModule { }

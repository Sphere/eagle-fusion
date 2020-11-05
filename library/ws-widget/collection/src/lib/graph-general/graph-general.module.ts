import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GraphGeneralComponent } from './graph-general.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatSelectModule, MatFormFieldModule } from '@angular/material'

@NgModule({
  declarations: [GraphGeneralComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSelectModule, MatFormFieldModule],
  entryComponents: [GraphGeneralComponent],
})
export class GraphGeneralModule {}

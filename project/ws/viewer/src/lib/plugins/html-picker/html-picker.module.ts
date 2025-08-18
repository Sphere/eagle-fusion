import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatExpansionModule } from '@angular/material/expansion'
import { MatButtonModule } from '@angular/material/button'


// import { AceEditorModule } from 'ng2-ace-editor'

import { HtmlPickerComponent } from './html-picker.component'

@NgModule({
  declarations: [HtmlPickerComponent],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    // AceEditorModule,
  ],
  exports: [
    HtmlPickerComponent,
  ],
})
export class HtmlPickerModule { }

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CkEditorComponent } from './ck-editor.component'
import { CKEditorModule } from 'ng2-ckeditor'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [CkEditorComponent],
  imports: [
    CommonModule,
    CKEditorModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    CkEditorComponent,
  ],
  entryComponents: [
    CkEditorComponent,
  ],
})
export class CkEditorModule { }

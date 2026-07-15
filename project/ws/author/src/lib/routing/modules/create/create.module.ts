import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { EditorContentService } from '../editor/services/editor-content.service'
import { EditorService } from '../editor/services/editor.service'
@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
  ],
  providers: [EditorContentService, EditorService],
})

export class CreateModule { }

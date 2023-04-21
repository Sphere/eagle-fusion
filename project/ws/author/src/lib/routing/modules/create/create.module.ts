import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { EditorContentService } from '../editor/services/editor-content.service'
import { EditorService } from '../editor/services/editor.service'
import { CatalogSelectModule } from './../editor/shared/components/catalog-select/catalog-select.module'
@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    CatalogSelectModule,
  ],
  providers: [UploadService, EditorContentService, EditorService],
})

export class CreateModule { }

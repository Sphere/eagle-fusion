import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CreateComponent } from './components/create/create.component'
import { EntityCardComponent } from './components/entity-card/entity-card.component'
import { RouterModule } from '@angular/router'
import { CreateService } from './components/create/create.service'
import { CreateCourseComponent } from './components/create-course/create-course.component'
import { EditorContentService } from '../editor/services/editor-content.service'
import { EditorService } from '../editor/services/editor.service'
import { CatalogSelectModule } from './../editor/shared/components/catalog-select/catalog-select.module'
@NgModule({
  declarations: [
    CreateComponent,
    EntityCardComponent,
    CreateCourseComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    CatalogSelectModule,
  ],
  providers: [CreateService, UploadService, EditorContentService, EditorService],
})

export class CreateModule { }

import { CreateContentResolverService } from './services/create-content-resolver.service'
import { AuthViewerModule } from '@ws/author/src/lib/modules/viewer/viewer.module'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { EditorService } from './services/editor.service'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { EditorSharedModule } from './shared/shared.module'

@NgModule({
  declarations: [

  ],
  imports: [
    AuthViewerModule,
    CommonModule,
    EditorSharedModule,
    SharedModule,
  ],
  providers: [
    EditorService,
    CreateContentResolverService,
  ],
})
export class EditorModule { }

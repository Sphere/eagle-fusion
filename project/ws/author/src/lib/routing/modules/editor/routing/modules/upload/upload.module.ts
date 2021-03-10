import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { AuthViewerModule } from '@ws/author/src/lib/modules/viewer/viewer.module'
import { EditorSharedModule } from '../../../shared/shared.module'
import { FileUploadComponent } from './components/file-upload/file-upload.component'
import { UploadComponent } from './components/upload/upload.component'
import { UploadRoutingModule } from './upload-routing.module'

@NgModule({
  declarations: [UploadComponent, FileUploadComponent],
  exports: [FileUploadComponent],
  imports: [CommonModule, SharedModule, EditorSharedModule, UploadRoutingModule, AuthViewerModule],
})
export class UploadModule {}

import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { AuthViewerModule } from '@ws/author/src/lib/modules/viewer/viewer.module'
import { EditorSharedModule } from '../../../shared/shared.module'
import { CurateComponent } from './components/curate/curate.component'
import { UrlUploadComponent } from './components/url-upload/url-upload.component'
import { CurateRoutingModule } from './curate-routing.module'

@NgModule({
  declarations: [CurateComponent, UrlUploadComponent],
  imports: [CommonModule, EditorSharedModule, SharedModule, CurateRoutingModule, AuthViewerModule],
  exports: [UrlUploadComponent],
})
export class CurateModule {}

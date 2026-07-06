import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DisplayContentTypeModule } from '@ws-widget/collection'
import { DefaultThumbnailModule, PipeDurationTransformModule } from '@ws-widget/utils'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { DragDropDirective } from './directives/drag-drop.directive'
import { UploadService } from './services/upload.service'

@NgModule({
    declarations: [
        DragDropDirective,
    ],
    imports: [
        CommonModule,
        DefaultThumbnailModule,
        PipeDurationTransformModule,
        DisplayContentTypeModule,
        SharedModule,
    ],
    exports: [
        DragDropDirective,
    ],
    providers: [UploadService],
})
export class EditorSharedModule { }

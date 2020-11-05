import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatPaginatorModule, MatTableModule } from '@angular/material'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { SharedModule } from '../../../../../../modules/shared/shared.module'
import { AuthViewerModule } from '../../../../../../modules/viewer/viewer.module'
import { EditorContentService } from '../../../services/editor-content.service'
import { EditorService } from '../../../services/editor.service'
import { PlainCKEditorComponent } from '../../../shared/components/plain-ckeditor/plain-ckeditor.component'
import { EditorSharedModule } from '../../../shared/shared.module'
import { IapAssessmentService } from './services/iap-assessment.service'
import { GeneralDetailsComponent } from './components/general-details/general-details.component'
import { IapAssessmentComponent } from './components/iap-assessment/iap-assessment.component'
import { SectionDialogComponent } from './components/section-dialog/section-dialog.component'
import { ViewQuestionDialogComponent } from './components/view-question-dialog/view-question-dialog.component'
import { IapAssessmentRoutingModule } from './iap-assessment.routing.module'

@NgModule({
  declarations: [IapAssessmentComponent, SectionDialogComponent, ViewQuestionDialogComponent, GeneralDetailsComponent],
  imports: [
    CommonModule,
    SharedModule,
    EditorSharedModule,
    IapAssessmentRoutingModule,
    AuthViewerModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  exports: [GeneralDetailsComponent],
  providers: [EditorContentService, EditorService, PlainCKEditorComponent, IapAssessmentService],
  entryComponents: [IapAssessmentComponent, SectionDialogComponent, ViewQuestionDialogComponent, ConfirmDialogComponent],
})
export class IapAssessmentModule { }

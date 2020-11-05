import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { QnaViewModule } from './qna-view/qna-view.module'
import { QnaHomeModule } from './qna-home/qna-home.module'
import { QnaEditModule } from './qna-edit/qna-edit.module'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    QnaEditModule,
    QnaHomeModule,
    QnaViewModule,
  ],
  exports: [],
})
export class QnaModule { }

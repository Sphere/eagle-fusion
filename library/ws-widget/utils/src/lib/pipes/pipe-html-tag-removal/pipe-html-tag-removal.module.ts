import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeHtmlTagRemovalPipe } from './pipe-html-tag-removal.pipe'

@NgModule({
  declarations: [PipeHtmlTagRemovalPipe],
  imports: [
    CommonModule,
  ],
  exports: [PipeHtmlTagRemovalPipe],
})
export class PipeHtmlTagRemovalModule { }

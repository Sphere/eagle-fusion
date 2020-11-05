import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ForumEditComponent } from './forum-edit.component'

@NgModule({
  declarations: [ForumEditComponent],
  imports: [
    CommonModule,
  ],
  exports: [
    ForumEditComponent,
  ],
})
export class ForumEditModule { }

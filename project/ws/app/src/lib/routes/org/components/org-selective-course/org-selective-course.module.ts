import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { OrgSelectiveCourseComponent } from './org-selective-course.component'

@NgModule({
  declarations: [OrgSelectiveCourseComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [OrgSelectiveCourseComponent]
})
export class OrgSelectiveCourseModule { }

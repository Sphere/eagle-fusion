import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { PublicHomeModule } from '../../../../../../../../../src/app/routes/public/public-home/public-home.module'
import { OrgSelectiveCourseComponent } from './org-selective-course.component'

@NgModule({
  declarations: [OrgSelectiveCourseComponent],
  imports: [
    CommonModule,
    TranslateModule,
    PublicHomeModule,
    RouterModule.forChild([{ path: '', component: OrgSelectiveCourseComponent }]),
  ],
  exports: [OrgSelectiveCourseComponent],
})
export class OrgSelectiveCourseModule { }

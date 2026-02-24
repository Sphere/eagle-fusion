import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
// OrgSelectiveCourseComponent is declared in AppModule directly (like OrgComponent)
// to access PublicHomeModule components (ws-mobile-course-view, ws-web-course-card)

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: []
})
export class OrgSelectiveCourseModule { }

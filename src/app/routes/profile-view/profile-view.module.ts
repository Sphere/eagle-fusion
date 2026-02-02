import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatDividerModule } from '@angular/material/divider'

import { MobileProfileDashboardComponent } from './mobile-profile-dashboard/mobile-profile-dashboard.component'
import { MobileAboutPopupComponent } from '../mobile-about-popup/mobile-about-popup.component'
import { ProfileSelectComponent } from './profile-select/profile-select.component'
import { EducationListComponent } from './education-list/education-list.component'
import { EducationEditComponent } from './education-edit/education-edit.component'
import { MobileProfileNavComponent } from './mobile-profile-nav/mobile-profile-nav.component'
import { WorkInfoListComponent } from './work-info-list/work-info-list.component'
import { WorkInfoEditComponent } from './work-info-edit/work-info-edit.component'
import { CertificateReceivedComponent } from './certificate-received/certificate-received.component'
import { PersonalDetailEditComponent } from './personal-detail-edit/personal-detail-edit.component'
import { LeadershipDashboardComponent } from './leadership-dashboard/leadership-dashboard.component'

@NgModule({
  declarations: [
    MobileProfileDashboardComponent,
    MobileAboutPopupComponent,
    ProfileSelectComponent,
    EducationListComponent,
    EducationEditComponent,
    MobileProfileNavComponent,
    WorkInfoListComponent,
    WorkInfoEditComponent,
    CertificateReceivedComponent,
    PersonalDetailEditComponent,
    LeadershipDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
  ],
  exports: [
    MobileProfileDashboardComponent,
    MobileAboutPopupComponent,
    ProfileSelectComponent,
    EducationListComponent,
    EducationEditComponent,
    MobileProfileNavComponent,
    WorkInfoListComponent,
    WorkInfoEditComponent,
    CertificateReceivedComponent,
    PersonalDetailEditComponent,
    LeadershipDashboardComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfileViewModule { }

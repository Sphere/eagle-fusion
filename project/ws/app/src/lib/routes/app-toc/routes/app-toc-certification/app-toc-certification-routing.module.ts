import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AccSlotBookingComponent } from './components/acc-slot-booking/acc-slot-booking.component'
import { AtDeskSlotBookingComponent } from './components/at-desk-slot-booking/at-desk-slot-booking.component'
import { BudgetApprovalComponent } from './components/budget-approval/budget-approval.component'
import { ResultUploadComponent } from './components/result-upload/result-upload.component'
import { AppTocCertificationComponent } from './components/app-toc-certification/app-toc-certification.component'
import { HomeComponent } from './components/home/home.component'

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
        children: [
          {
            path: '',
            component: AppTocCertificationComponent,
          },
          {
            path: 'acc',
            component: AccSlotBookingComponent,
          },
          {
            path: 'atDesk',
            component: AtDeskSlotBookingComponent,
          },
          {
            path: 'budgetApproval',
            component: BudgetApprovalComponent,
          },
          {
            path: 'resultUpload',
            component: ResultUploadComponent,
          },
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class AppTocCertificationRoutingModule { }

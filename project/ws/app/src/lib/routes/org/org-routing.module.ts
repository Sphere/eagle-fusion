import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
// import { OrgComponent } from './components/org/org.component'
// import { OrgServiceService } from './org-service.service'
import { AllCoursesComponent } from './components/all-courses/all-courses.component'

const routes: Routes = []

@NgModule({
  imports: [
    RouterModule.forChild([
      // {
      //   path: '',
      //   component: OrgComponent,
      //   resolve: {
      //     orgData: OrgServiceService,
      //   },
      //   children: routes,
      // },
      {
        path: 'all-courses',
        component: AllCoursesComponent,
        children: routes,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class OrgRoutingModule { }

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { OrgHomeComponent } from './org-home/org-home.component'
import { RouterModule, Routes } from '@angular/router'
import { AppComponent } from './public/app/app.component'

const routes: Routes = [
  {
    path: 'home',
    pathMatch: 'full',
    component: OrgHomeComponent,
  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    component: OrgHomeComponent,
  },
  {
    path: 'course-view',
    pathMatch: 'full',
    component: OrgHomeComponent,
  },
  {
    path: 'profile-view',
    pathMatch: 'full',
    component: OrgHomeComponent,
  },
  {
    path: 'home',
    pathMatch: 'full',
    component: OrgHomeComponent,
  },
  {
    path: 'home',
    pathMatch: 'full',
    component: OrgHomeComponent,
  },
  {
    path: 'home',
    pathMatch: 'full',
    component: OrgHomeComponent,
  },
]

@NgModule({
  declarations: [OrgHomeComponent, AppComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TranslateModule,
  ],
  exports: [OrgHomeComponent, TranslateModule],
})
export class OrganisationsModule { }

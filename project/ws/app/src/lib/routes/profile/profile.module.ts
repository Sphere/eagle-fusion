import { CommonModule } from '@angular/common'
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule } from '@angular/router'
import { BtnPageBackModule } from '@ws-widget/collection'
import { LogoutModule } from '@ws-widget/utils'
// modules
import { ProfileRoutingModule } from './profile-routing.module'
// comps
import { ProfileComponent } from './profile.component'
import { DashboardModule } from './routes/dashboard/dashboard.module'
import { SettingsModule } from './routes/settings/settings.module'

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    DashboardModule,
    SettingsModule,
    BtnPageBackModule,
    LogoutModule,
    RouterModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileModule { }

import { Component, OnInit } from '@angular/core'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { Router } from '@angular/router'
import { BtnGoalsService } from '@ws-widget/collection'

@Component({
  selector: 'ws-app-goal-home',
  templateUrl: './goal-home.component.html',
  styleUrls: ['./goal-home.component.scss'],
})
export class GoalHomeComponent implements OnInit {
  navBackground: Partial<NsPage.INavBackground>
  userName: string | undefined
  numNotifications = 0
  isShareEnabled = false

  goalFor = 'me'

  constructor(
    private router: Router,
    private configSvc: ConfigurationsService,
    private goalsSvc: BtnGoalsService,
  ) {
    this.navBackground = this.configSvc.pageNavBar
    if (this.configSvc.userProfile) {
      this.userName = (this.configSvc.userProfile.userName || '').split(' ')[0]
    }
  }

  ngOnInit() {

    if (this.configSvc.restrictedFeatures) {
      this.isShareEnabled = !this.configSvc.restrictedFeatures.has('share')
    }

    this.goalFor = this.router.url.includes('others') ? 'others' : 'me'
    this.goalsSvc.getActionRequiredGoals('isInIntranet').subscribe(actionRequired => {
      this.numNotifications = actionRequired.length
    })
  }

  goalToggle(tab: string) {
    if (tab === 'me') {
      this.router.navigate(['/app/goals/me/all'])
    } else if (tab === 'others') {
      this.router.navigate(['/app/goals/others'])
    }
  }
}

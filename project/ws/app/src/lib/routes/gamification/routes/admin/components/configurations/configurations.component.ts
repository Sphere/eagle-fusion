import { Component, OnInit } from '@angular/core'
import { GamificationService } from '../../../../services/gamification.service'
import { MatSelectChange } from '@angular/material'
@Component({
  selector: 'ws-app-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.scss'],
})
export class ConfigurationsComponent implements OnInit {
  fetchStatus = ''
  configsData!: any
  public sideNavBarOpened = false
  sprintSelected!: any
  sprint = 'h1'
  roleName = 'Sales Manager'
  rolesList = ['All', 'Sales Manager', 'Service Technician',
    'Parts Manager', 'Sales Consultant', 'Service Manager', 'Service Advisor', 'Dealer/Partner',
    'Parts Sales Person']
  result!: any
  col1!: any
  con!: any
  col2!: any
  objectKeys = Object.keys
  constructor(private gamificationSvc: GamificationService) { }

  ngOnInit() {
    this.fetchConfigs()
  }

  fetchConfigs() {
    this.fetchStatus = 'fetching'
    this.gamificationSvc.fetchConfigs(this.sprint, this.roleName).subscribe(data => {
      this.configsData = data
      this.col1 = JSON.parse(this.configsData.Column1)
      this.col2 = JSON.parse(this.configsData.Column2)
      this.fetchStatus = 'done'
    })
  }

  // Function to capture sprint value
  sprintChanged(path: MatSelectChange) {
    if (path.value === 'h1') {
      this.sprint = 'h1'
    }
    if (path.value === 'h2') {
      this.sprint = 'h2'
    }
    if (path.value === 'fy') {
      this.sprint = 'fy'
    }
    this.fetchConfigs()
  }

  roleChanged(path: MatSelectChange) {
    this.roleName = path.value
    this.fetchConfigs()
  }

  updateConfigs(col1: [], col2: []) {
    const configList = {
      ApplicationId: 53200,
      Sprint: this.sprint,
      JobRole: this.roleName,
      Column1: col1,
      Column2: col2,
    }
    this.gamificationSvc.updateConfigs(configList).subscribe(data => {
      this.result = data
    })
  }

}

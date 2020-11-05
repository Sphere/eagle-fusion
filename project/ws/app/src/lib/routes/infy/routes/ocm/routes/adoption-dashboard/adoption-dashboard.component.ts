import { Component, OnInit, Input } from '@angular/core'
import { CounterService } from '../../services/counter.service'
import { TFetchStatus } from '@ws-widget/utils'
import { IWsStatsConfig } from '../../models/ocm.model'

import { IWsCounterPlatformResponse, IWsCounterInfyMeResponse } from '../../models/counter.model'

type TStatTitleKey = 'Wingspan' | 'infyme'
@Component({
  selector: 'ws-app-adoption-dashboard',
  templateUrl: './adoption-dashboard.component.html',
  styleUrls: ['./adoption-dashboard.component.scss'],
})
export class AdoptionDashboardComponent implements OnInit {
  @Input() config: IWsStatsConfig | null = null
  lexCounterData: IWsCounterPlatformResponse | null = null
  infyMeCounterData: IWsCounterInfyMeResponse | null = null
  lexStatFetchStatus: TFetchStatus = 'none'
  infyMeStatFetchStatus: TFetchStatus = 'none'

  stats: { title: string; titleKey: string; iconName: string; count: number }[] = []
  currentStat: TStatTitleKey = 'Wingspan'
  counterEnabled = false
  constructor(private counterSvc: CounterService) { }

  ngOnInit() {
    // const instanceConfig =  this.configSvc.getInstanceConfig()
    // const counterStatus = instanceConfig.featureStatus.get(EnumWsInstanceFeature.COUNTER)
    // if (counterStatus) {
    // this.counterEnabled = counterStatus.isAvailable
    this.counterEnabled = true
    // }
    this.currentStat = 'Wingspan'
    this.statsClicked()
  }

  statsClicked() {
    switch (this.currentStat) {
      case 'Wingspan': {
        this.lexStatFetchStatus = 'fetching'
        this.fetchWingspanCounterData()
        break
      }
      case 'infyme': {
        this.infyMeStatFetchStatus = 'fetching'
        this.fetchInfyMeCounterData()
        break
      }
    }
  }

  fetchWingspanCounterData() {
    this.counterSvc.fetchPlatformCounterData().subscribe(
      data => {
        this.lexCounterData = data
        this.lexStatFetchStatus = 'done'
        if (this.lexCounterData) {
          this.processWingspanCounterData()
        }
      },
      () => {
        this.lexStatFetchStatus = 'error'
      },
    )
  }

  fetchInfyMeCounterData() {
    this.counterSvc.fetchInfyMeCounterData().subscribe(
      data => {
        this.infyMeCounterData = data
        this.infyMeStatFetchStatus = 'done'
        if (this.infyMeCounterData) {
          this.processInfyMeCounterData()
        }
      },
      () => {
        this.infyMeStatFetchStatus = 'error'
      },
    )
  }

  processWingspanCounterData() {
    const lexCounterData = this.lexCounterData
    if (lexCounterData) {
      this.stats = this.stats.filter(stat => stat.titleKey !== 'Wingspan')
      this.stats.push(
        {
          title: 'Total unique learners on Wingspan',
          titleKey: 'Wingspan',
          iconName: 'people',
          count: lexCounterData.users[lexCounterData.users.length - 1].count,
        },
        {
          title: 'Average request per second',
          titleKey: 'Wingspan',
          iconName: 'access_time',
          count: lexCounterData.load[lexCounterData.load.length - 1].count,
        },
        {
          title: 'Active Learners in last 5 mins',
          titleKey: 'Wingspan',
          iconName: 'notifications',
          count: lexCounterData.learners[lexCounterData.learners.length - 1].count,
        },
      )
    }
  }

  processInfyMeCounterData() {
    const infyMeCounterData = this.infyMeCounterData
    if (infyMeCounterData) {
      this.stats = this.stats.filter(stat => stat.titleKey !== 'infyme')
      this.stats.push(
        {
          title: 'Total downloads',
          titleKey: 'infyme',
          iconName: '',
          count: infyMeCounterData.totalDownloads,
        },
        {
          title: 'Yesterday\'s Download ',
          titleKey: 'infyme',
          iconName: '',
          count: infyMeCounterData.yesterdaysDownloads,
        },
      )
    }
  }
}

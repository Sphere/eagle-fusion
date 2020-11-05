import { Component, OnInit, OnDestroy } from '@angular/core'
import {
  ActivatedRoute,
  Router,
  NavigationStart,
  NavigationEnd,
} from '@angular/router'
import { Subscription } from 'rxjs'
import { TFetchStatus, IResolveResponse } from '@ws-widget/utils'
import {
  ILeaderboard,
  IHallOfFameItem,
  EDurationTypeRouteParam,
  ILeaderboardPrevNext,
} from '../../../../routes/leaderboard/models/leaderboard.model'
import { LeaderboardService } from '../../../../routes/leaderboard/services/leaderboard.service'

@Component({
  selector: 'ws-app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  private routerSub!: Subscription
  private routeDataSub!: Subscription
  private routeUrlSub!: Subscription
  leaderboard!: ILeaderboard
  leaderboardError!: string
  hallOfFame!: IHallOfFameItem[]
  durationType!: EDurationTypeRouteParam
  fetchStatus: TFetchStatus

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leaderboardSvc: LeaderboardService,
  ) {
    this.fetchStatus = 'none'
  }

  ngOnInit() {
    this.routeDataSub = this.route.data.subscribe(data => {
      const leaderboardResolve = data.leaderboardResolve as IResolveResponse<ILeaderboard>

      if (leaderboardResolve.data) {
        this.leaderboard = leaderboardResolve.data
      }

      if (leaderboardResolve.error) {
        this.leaderboardError = leaderboardResolve.error
      }
    })

    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.fetchStatus = 'fetching'
      } else if (event instanceof NavigationEnd) {
        this.fetchStatus = 'done'
      }
    })

    this.routeUrlSub = this.route.url.subscribe(url => {
      this.durationType = url[url.length - 1].path as EDurationTypeRouteParam
    })
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe()
    }

    if (this.routeDataSub) {
      this.routeDataSub.unsubscribe()
    }

    if (this.routeUrlSub) {
      this.routeUrlSub.unsubscribe()
    }
  }

  fetchPrevNextLeaderboard(prevNext: ILeaderboardPrevNext) {
    const url = this.route.snapshot.url
    const tab: EDurationTypeRouteParam = url[url.length - 1].path as EDurationTypeRouteParam
    this.fetchLeaderboard(tab, prevNext)
  }

  private fetchLeaderboard(tab: EDurationTypeRouteParam, prevNext?: ILeaderboardPrevNext) {
    this.fetchStatus = 'fetching'
    this.leaderboardSvc.getLeaderboard(tab, prevNext).subscribe(
      (lb: ILeaderboard) => {
        this.leaderboard = lb
        this.fetchStatus = 'done'
      },
      () => {
        this.fetchStatus = 'error'
      },
    )
  }
}

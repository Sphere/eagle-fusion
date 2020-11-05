import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { MatTabChangeEvent } from '@angular/material'
import { Observable, Subject } from 'rxjs'
import { map, filter, switchMap, takeUntil } from 'rxjs/operators'

import { IResolveResponse } from '@ws-widget/utils'

import { ITrainingUserPrivileges } from '../../../../models/training-api.model'

@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private componentDestroyed$: Subject<any>

  currentTabIndex!: number
  tabs: string[]
  trainingPrivileges$?: Observable<ITrainingUserPrivileges>

  constructor(private router: Router, private route: ActivatedRoute) {
    this.tabs = ['schedule', 'feedback', 'approval', 'jit']
    this.componentDestroyed$ = new Subject<any>()
  }

  ngOnInit() {
    let tab: string
    if (this.route.children[0].snapshot.url.length) {
      tab = this.route.children[0].snapshot.url[0].path
    } else {
      tab = ''
    }
    this.currentTabIndex = tab ? this.tabs.indexOf(tab) : 0

    this.router.events
      .pipe(
        takeUntil(this.componentDestroyed$),
        filter(event => {
          if (event instanceof NavigationEnd) {
            return true
          }
          return false
        }),
        switchMap(() => this.route.children[0].url),
      )
      .subscribe(
        url => {
          try {
            const tabName = url[0].path
            this.currentTabIndex = this.tabs.indexOf(tabName)
          } catch (e) {
            this.currentTabIndex = 0
          }
        },
        () => {
          this.currentTabIndex = 0
        },
      )

    this.trainingPrivileges$ = this.route.data.pipe(
      takeUntil(this.componentDestroyed$),
      map(
        data =>
          (data.trainingPrivilegesResolve as IResolveResponse<
            ITrainingUserPrivileges
          >).data || {
            canNominate: false,
            canRequestJIT: false,
          },
      ),
    )
  }

  ngOnDestroy() {
    this.componentDestroyed$.next()
    this.componentDestroyed$.complete()
  }

  navigateToTab(event: MatTabChangeEvent) {
    this.router.navigate([`${this.tabs[event.index] || this.tabs[0]}`], {
      relativeTo: this.route,
    })
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatTabChangeEvent } from '@angular/material'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { EFeedbackRole, EFeedbackType, IFeedbackSummary } from '@ws-widget/collection'
import { IResolveResponse } from '@ws-widget/utils'
import { Subject } from 'rxjs'
import { filter, switchMap, takeUntil } from 'rxjs/operators'

@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit, OnDestroy {
  currentTabIndex!: number
  tabs: string[]
  newItemsCount: number
  feedbackTypes: typeof EFeedbackType
  typeToRoleMap: Map<EFeedbackType, EFeedbackRole>
  feedbackSummary?: IFeedbackSummary
  rolesSet: Set<string>
  subscriptionSubject$: Subject<any>

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.subscriptionSubject$ = new Subject<any>()
    this.feedbackTypes = EFeedbackType
    this.newItemsCount = 0
    this.tabs = []
    this.rolesSet = new Set()

    const feedbackSummaryResolve = this.route.snapshot.data['feedbackSummary'] as IResolveResponse<
      IFeedbackSummary
      >
    if (feedbackSummaryResolve.data) {
      this.feedbackSummary = feedbackSummaryResolve.data
      this.newItemsCount = feedbackSummaryResolve.data.forActionCount
      this.feedbackSummary.roles.forEach(role => {
        if (
          role.enabled &&
          role.role !== EFeedbackRole.Author &&
          role.role !== EFeedbackRole.Platform
        ) {
          this.rolesSet.add(role.role)
        }
      })
    }

    this.typeToRoleMap = new Map([
      [EFeedbackType.Platform, EFeedbackRole.User],
      [EFeedbackType.ContentRequest, EFeedbackRole.Content],
      [EFeedbackType.ServiceRequest, EFeedbackRole.Service],
    ])

    this.initTabs()
  }

  ngOnInit() {
    let tab
    if (this.route.children[0].snapshot.url.length) {
      tab = this.route.children[0].snapshot.url[0].path
    } else {
      tab = ''
    }
    this.currentTabIndex = tab ? this.tabs.indexOf(tab) : 0

    this.router.events
      .pipe(
        takeUntil(this.subscriptionSubject$),
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
  }

  ngOnDestroy() {
    this.subscriptionSubject$.next()
    this.subscriptionSubject$.complete()
  }

  navigateToTab(event: MatTabChangeEvent) {
    this.router.navigate([`${this.tabs[event.index] || this.tabs[0]}`], {
      relativeTo: this.route,
    })
  }

  showTab(feedbackType: EFeedbackType): boolean {
    const feedbackRole = this.typeToRoleMap.get(feedbackType)
    if (feedbackRole && this.rolesSet.has(feedbackRole) && this.rolesSet.size > 1) {
      return true
    }
    return false
  }

  initTabs() {
    const allTabs = [
      EFeedbackType.Platform,
      EFeedbackType.ContentRequest,
      EFeedbackType.ServiceRequest,
    ]

    allTabs.forEach(tab => {
      const feedbackRole = this.typeToRoleMap.get(tab)
      const roleDetail = this.feedbackSummary
        ? this.feedbackSummary.roles.find(role => role.role === feedbackRole)
        : undefined
      if (roleDetail && roleDetail.enabled) {
        this.tabs.push(tab)
      }
    })
  }
}

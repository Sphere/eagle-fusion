import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'

import { EFeedbackRole, IFeedbackSummary } from '@ws-widget/collection'
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
  feedbackRoles: typeof EFeedbackRole
  rolesSet: Set<string>
  subscriptionSubject$: Subject<any>

  constructor(private route: ActivatedRoute, private router: Router) {
    this.subscriptionSubject$ = new Subject<any>()
    this.tabs = []
    this.feedbackRoles = EFeedbackRole
    this.rolesSet = new Set()
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

  showTabNavBar(): boolean {
    if (this.rolesSet.size === 1) {
      return false
    }
    return true
  }

  showTab(tabKey: EFeedbackRole): boolean {
    if (this.rolesSet.has(tabKey)) {
      return true
    }
    return false
  }

  navigateToTab(tabIndex: number) {
    this.currentTabIndex = tabIndex
    this.router.navigate([`${this.tabs[tabIndex] || this.tabs[0]}`], {
      relativeTo: this.route,
    })
  }

  onClickFeedbackItem(feedbackId: string) {
    this.router.navigate([`./${feedbackId}`], { relativeTo: this.route })
  }

  private initTabs() {
    const allTabs = [
      EFeedbackRole.User,
      EFeedbackRole.Author,
      EFeedbackRole.Platform,
      EFeedbackRole.Content,
      EFeedbackRole.Service,
    ]

    const feedbackSummaryResolve: IResolveResponse<IFeedbackSummary> = this.route.snapshot.data
      .feedbackSummary

    if (feedbackSummaryResolve && feedbackSummaryResolve.data) {
      const roles = feedbackSummaryResolve.data.roles

      roles.forEach(feedbackRole => {
        if (feedbackRole.enabled && feedbackRole.hasAccess) {
          this.rolesSet.add(feedbackRole.role)
        }
      })

      allTabs.forEach(tab => {
        if (this.showTab(tab)) {
          this.tabs.push(tab)
        }
      })
    }
  }
}

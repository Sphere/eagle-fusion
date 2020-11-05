import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, NavigationStart, Router } from '@angular/router'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { EditorContentV2Service } from '@ws/author/src/lib/routing/modules/editor/services/editor-content-v2.service'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'
import { MatDialog } from '@angular/material'
import { ValueService } from '@ws-widget/utils'
import { StatusTrackComponent } from '../../../../../modules/shared/components/status-track/status-track.component'

@Component({
  selector: 'ws-auth-root-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  providers: [EditorContentService, EditorContentV2Service],
})
export class EditorComponent implements OnInit, OnDestroy {
  routerSubscription!: Subscription
  routerEventSubscription!: Subscription
  isMobile = false
  constructor(
    private dialog: MatDialog,
    private valueSvc: ValueService,
    private router: ActivatedRoute,
    private route: Router,
    private contentService: EditorContentService,
    private snackBar: MatSnackBar,
    private contentV2Service: EditorContentV2Service,
    private initSvc: AuthInitService,
  ) {
    this.routerEventSubscription = this.route.events
      .pipe(
        filter((event: any) => {
          return event instanceof NavigationStart
        }),
      )
      .subscribe((event: NavigationStart) => {
        if (event.navigationTrigger === 'popstate') {
          if (event.url.indexOf('author/editor') > -1) {
            window.history.go(-1)
          }
        }
      })
  }

  ngOnDestroy() {
    this.contentService.reset()
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
    if (this.routerEventSubscription) {
      this.routerEventSubscription.unsubscribe()
    }
  }

  async ngOnInit() {
    this.valueSvc.isXSmall$.subscribe(isMobile => (this.isMobile = isMobile))
    let hasAccess = false
    this.routerSubscription = await this.router.data.subscribe(data => {
      if (data.contents && data.contents.length) {
        const contents: { content: NSContent.IContentMeta; data: any }[] = data.contents
        hasAccess = this.contentService.hasAccess(contents[0].content)
        if (
          ['Deleted', 'Unpublished', 'Expired', 'MarkedForDeletion'].includes(
            contents[0].content.status,
          )
        ) {
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.DELETED,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.route.navigateByUrl('/author/home')
          return
        }
        if (!hasAccess || contents[0].content.isMetaEditingDisabled) {
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.NO_ACCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.route.navigateByUrl('/author/home')
          return
        }
        contents.map(v => {
          if (
            this.contentService.hasAccess(v.content) &&
            !v.content.isMetaEditingDisabled &&
            !['Deleted', 'Unpublished', 'Expired'].includes(v.content.status)
          ) {
            this.contentService.setOriginalMeta(v.content)
            this.contentV2Service.contentMetaMap.set(v.content.identifier, v.content)
            this.contentV2Service.contentDataMap.set(v.content.identifier, v.data)
            this.contentV2Service.parentContent.push(v.content.identifier)
          }
        })
        if (
          ['InReview', 'Reviewed', 'QualityReview'].includes(contents[0].content.status) &&
          this.initSvc.authAdditionalConfig.allowActionHistory
        ) {
          this.dialog.open(StatusTrackComponent, {
            width: this.isMobile ? '90vw' : '800px',
            height: 'auto',
            data: contents[0].content,
          })
        }
        this.contentV2Service.changeActiveCont.next(contents[0].content.identifier)
        this.contentV2Service.changeActiveParentCont.next(contents[0].content.identifier)
        this.contentService.changeActiveCont.next(contents[0].content.identifier)
        this.contentService.currentContent = contents[0].content.identifier
        this.contentService.parentContent = contents[0].content.identifier
        if (
          ['Course', 'Collection', 'Learning Path'].indexOf(contents[0].content.contentType) > -1 &&
          !contents[0].content.isExternal
        ) {
          this.route.navigate(['collection'], { relativeTo: this.router })
        } else if (contents[0].content.contentType === 'Channel') {
          this.route.navigate(['channel'], { relativeTo: this.router })
        } else if (contents[0].content.contentType === 'Knowledge Board') {
          this.route.navigate(['knowledge-board'], { relativeTo: this.router })
        } else if (contents[0].content.contentType === 'Knowledge Artifact') {
          this.route.navigate(['kartifact-pa'], { relativeTo: this.router })
        } else if (
          ['application/pdf', 'application/x-mpegURL', 'audio/mpeg'].indexOf(
            contents[0].content.mimeType,
          ) > -1
        ) {
          this.route.navigate(['upload'], { relativeTo: this.router })
        } else if (
          contents[0].content.mimeType === 'application/html' &&
          !contents[0].content.isExternal
        ) {
          this.route.navigate(['upload'], { relativeTo: this.router })
        } else if (contents[0].content.mimeType === 'application/iap-assessment') {
          this.route.navigate(['iap-assessment'], { relativeTo: this.router })
        } else if (
          contents[0].content.mimeType === 'application/quiz' &&
          contents[0].content.categoryType === 'Quiz'
        ) {
          this.route.navigate(['quiz'], { relativeTo: this.router })
        } else if (
          contents[0].content.mimeType === 'application/quiz' &&
          contents[0].content.categoryType === 'Assessment'
        ) {
          this.route.navigate(['assessment'], { relativeTo: this.router })
        } else if (contents[0].content.mimeType === 'application/web-module') {
          this.route.navigate(['web-module'], { relativeTo: this.router })
        } else if (contents[0].content.mimeType === 'application/class-diagram') {
          this.route.navigate(['class-diagram'], { relativeTo: this.router })
        } else {
          this.route.navigate(['curate'], { relativeTo: this.router })
        }
      }
    })
  }
}

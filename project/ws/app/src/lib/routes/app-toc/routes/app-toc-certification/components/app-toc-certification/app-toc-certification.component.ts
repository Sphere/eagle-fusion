import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { noop, Subject, throwError, of } from 'rxjs'

import { NsContent } from '@ws-widget/collection'
import { TFetchStatus } from '@ws-widget/utils'

import { ICertificationMeta } from '../../models/certification.model'
import { CertificationService } from '../../services/certification.service'
import { switchMap, catchError, takeUntil } from 'rxjs/operators'
import { CertificationApiService } from '../../apis/certification-api.service'

@Component({
  selector: 'ws-app-toc-certification',
  templateUrl: './app-toc-certification.component.html',
  styleUrls: ['./app-toc-certification.component.scss'],
})
export class AppTocCertificationComponent implements OnInit, OnDestroy {
  content?: NsContent.IContent | null
  certification?: ICertificationMeta
  fetchStatus: TFetchStatus
  certificationFetchSubject: Subject<any>
  subscriptionSubject$: Subject<any>

  constructor(
    private route: ActivatedRoute,
    private certificationSvc: CertificationService,
    private certificationApi: CertificationApiService,
  ) {
    this.fetchStatus = 'none'
    this.certificationFetchSubject = new Subject<any>()
    this.subscriptionSubject$ = new Subject<any>()
  }

  ngOnInit() {
    this.subscribeToContentResolve()
    this.subscribeToCertificationResolve()
    this.subscribeToCertificationFetchSubject()
  }

  ngOnDestroy() {
    this.subscriptionSubject$.next()
    this.subscriptionSubject$.complete()
  }

  onSlotCancel() {
    if (this.content) {
      this.certificationApi
        .getCertificationInfo(this.content.identifier)
        .subscribe(
          certification => { this.certification = certification },
          noop,
        )
    }
  }

  private subscribeToCertificationResolve() {
    this.fetchStatus = 'fetching'
    this.certificationSvc.getCertificationMeta(this.route)
      .pipe(takeUntil(this.subscriptionSubject$))
      .subscribe(
        certificationData => {
          this.certification = certificationData
          this.fetchStatus = 'done'
        },
        () => {
          this.fetchStatus = 'error'
        },
      )
  }

  private subscribeToContentResolve() {
    this.certificationSvc.getContentMeta(this.route)
      .pipe(takeUntil(this.subscriptionSubject$))
      .subscribe(content => {
        this.content = content
      },         noop)
  }

  private subscribeToCertificationFetchSubject() {
    this.certificationFetchSubject
      .pipe(
        takeUntil(this.subscriptionSubject$),
        switchMap(() => {
          if (this.content) {
            return this.certificationApi.getCertificationInfo(this.content.identifier)
          }

          return throwError('no content')
        }),
        catchError(() => of(this.certification)),
      )
      .subscribe(certification => {
        this.certification = certification
      })
  }
}

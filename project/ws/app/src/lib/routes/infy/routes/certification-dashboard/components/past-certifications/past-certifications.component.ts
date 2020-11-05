import { Component, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { BehaviorSubject, noop } from 'rxjs'
import { tap, switchMap } from 'rxjs/operators'

import { TFetchStatus } from '@ws-widget/utils'

import {
  TCertificationCompletionStatus,
  ICertificationSubmission,
} from '../../../../../app-toc/routes/app-toc-certification/models/certification.model'
import { CertificationApiService } from '../../../../../app-toc/routes/app-toc-certification/apis/certification-api.service'

@Component({
  selector: 'ws-app-past-certifications',
  templateUrl: './past-certifications.component.html',
  styleUrls: ['./past-certifications.component.scss'],
})
export class PastCertificationsComponent implements OnInit {
  pastCertifications: ICertificationSubmission[]
  certificationsFetchStatus: TFetchStatus
  statusControl: FormControl
  fetchSubject: BehaviorSubject<TCertificationCompletionStatus>

  constructor(private certificationApi: CertificationApiService) {
    this.pastCertifications = []
    this.certificationsFetchStatus = 'none'
    this.statusControl = new FormControl('completed')
    this.fetchSubject = new BehaviorSubject(this.statusControl.value)
  }

  ngOnInit() {
    this.fetchSubject
      .pipe(
        tap(() => {
          this.certificationsFetchStatus = 'fetching'
        }),
        switchMap(status => this.certificationApi.getPastCertifications(status)),
      )
      .subscribe(
        certifications => {
          this.pastCertifications = certifications
          this.certificationsFetchStatus = 'done'
        },
        () => {
          this.certificationsFetchStatus = 'error'
        },
      )

    this.statusControl.valueChanges.subscribe((value: TCertificationCompletionStatus) => {
      this.fetchSubject.next(value)
    },                                        noop)
  }
}

import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { of } from 'rxjs'
import { finalize, map, mergeMap } from 'rxjs/operators'
import { ConfigurationsService, LoggerService } from '@ws-widget/utils'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/public-api'

@Component({
  standalone: false,
  selector: 'app-asha-learning-completed',
  templateUrl: './asha-learning-completed.component.html',
  styleUrls: ['./asha-learning-completed.component.scss'],
})
export class AshaLearningCompletedComponent implements OnInit {
  @Input() ashaData: any
  @Input() completedCount = 0
  isCertificateLoading = false
  certificateMessage = ''

  constructor(
    private readonly router: Router,
    private readonly contentSvc: WidgetContentService,
    private readonly configSvc: ConfigurationsService,
    private readonly translate: TranslateService,
    private readonly logger: LoggerService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    // Intentionally empty
  }

  viewCourses(data) {
    if (data.competencyID) {
      this.router.navigate(['/app/search'], {
        queryParams: {
          q: [
            `${data.competencyID}-1`,
            `${data.competencyID}-2`,
            `${data.competencyID}-3`,
            `${data.competencyID}-4`,
            `${data.competencyID}-5`,
          ],
          competency: true,
          redirect: 'page/home',
        },
        queryParamsHandling: 'merge',
      })
    }
  }

  // Only a GENERATED status has a certificate to download; any other status is shown to the
  // learner in the info banner below the card, using the API's own message when it sends one.
  downloadCertificate(event?: Event): void {
    event?.stopPropagation()
    const userId = this.configSvc.userProfile?.userId
    const competencyId = this.ashaData?.competencyID
    if (!userId || !competencyId || this.isCertificateLoading) {
      return
    }
    this.isCertificateLoading = true
    this.certificateMessage = ''
    this.contentSvc.fetchCompetencyCertificateStatus(userId, String(competencyId)).pipe(
      mergeMap((statusList: any[]) => {
        const status = (statusList || []).find(item => String(item?.competencyId) === String(competencyId))
        if (status?.status !== 'GENERATED') {
          return of({ status, cert: null })
        }
        return this.contentSvc.fetchCompetencyCertificate(userId, String(competencyId)).pipe(
          map(cert => ({ status, cert })),
        )
      }),
      finalize(() => {
        this.isCertificateLoading = false
        this.cdr.detectChanges()
      }),
    ).subscribe({
      next: ({ status, cert }) => {
        if (cert?.certificateUrl) {
          this.saveCertificate(cert.certificateUrl)
        } else if (status && status.status !== 'GENERATED') {
          this.certificateMessage = status.message || this.translate.instant('Your certificate is not ready yet')
        } else {
          this.certificateMessage = this.translate.instant('We could not load your certificate')
        }
      },
      error: (err: any) => {
        this.logger.error('[AshaLearningCompleted] competency certificate failed: ' + competencyId, err)
        this.certificateMessage = this.translate.instant('We could not load your certificate')
      },
    })
  }

  saveCertificate(url: string): void {
    const fileName = `${(this.ashaData?.title || 'Competency').replaceAll(/\s+/g, '')}_certificate.jpg`
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.blob()
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = blobUrl
        anchor.download = fileName
        anchor.click()
        URL.revokeObjectURL(blobUrl)
      })
      .catch(error => {
        this.logger.error('[AshaLearningCompleted] certificate download failed:', error)
        this.certificateMessage = this.translate.instant('We could not load your certificate')
        this.cdr.detectChanges()
      })
  }
}

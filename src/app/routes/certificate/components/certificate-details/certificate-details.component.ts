import { Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { trim, get, upperCase } from 'lodash'
import moment from 'moment'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ConfigurationsService, SafeResourceUrlService } from '@ws-widget/utils'
import { ApiService } from '@ws/author/src/public-api'
import {
  CertificateService,
  ICertificateVerifyResponse,
  IVerifiedCertificate,
} from '../../services/certificate.service'
import { SafeUrl } from '@angular/platform-browser'

/**
 * What the page shows for the scanned id:
 * checking -> RC lookup in progress; verified -> certificate card;
 * code -> old access-code check (not in RC, migration not marked complete); invalid.
 */
export type CertificatePageStage = 'checking' | 'verified' | 'code' | 'invalid'

@Component({
  standalone: false,
  selector: 'app-certificate-details',
  templateUrl: './certificate-details.component.html',
  styleUrls: ['./certificate-details.component.scss'],

})
export class CertificateDetailsComponent implements OnInit, OnDestroy {
  appIcon: SafeUrl | null = null
  stage: CertificatePageStage = 'checking'
  certificateImage: SafeUrl | null = null
  /** blob: URLs created for the rendered certificate; revoked on destroy. */
  private readonly objectUrls: string[] = []
  loader!: boolean
  viewCertificate!: boolean
  error = false
  enableVerifyButton = false
  certificateCode!: string
  wrongCertificateCode = false
  instance!: string
  collectionData!: any
  pageId!: string
  contentId!: string
  showVideoThumbnail = true

  /** To store the certificate details data */
  recipient = ''
  courseName = ''
  issuedOn = ''
  maskedEmail = ''
  maskedPhone = ''
  watchVideoLink!: string
  urls = {
    HIERARCHY: 'course/v1/hierarchy',
    LEARNER_PREFIX: '/learner/',
  }
  @ViewChild('codeInputField', { static: false }) codeInputField!: ElementRef

  /** Phone takes priority over email; empty when neither is available (no empty parentheses shown) */
  get contactDisplay(): string {
    return trim(this.maskedPhone) || trim(this.maskedEmail) || ''
  }

  constructor(
    public activatedRoute: ActivatedRoute,
    public certificateService: CertificateService,
    public configService: ConfigurationsService,
    private readonly safeResourceUrlSvc: SafeResourceUrlService,
    public apiService: ApiService,
    public router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.instance = upperCase(this.configService.rootOrg || 'aastrika')
    this.appIcon = this.safeResourceUrlSvc.trust(
      'fusion-assets/images/Sphere_Logo_4.svg',
    )
    this.verifyFromQr()
  }

  ngOnDestroy() {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url))
  }

  /** Every old cert-registry certificate is in RC, so "not found" can be reported as invalid. */
  get migrationCompleted(): boolean {
    return this.configService.instanceConfig?.certificateMigrationCompleted === true
  }

  /**
   * QR scans land here with the certificate id (and, for RC certificates, ?entity=).
   * Sunbird RC is checked first - by id, then as the oldId of a migrated certificate -
   * so new, migrated and pre-migration printed certificates verify without a code.
   */
  verifyFromQr() {
    const id = this.activatedRoute.snapshot.params.uuid
    const entity = this.activatedRoute.snapshot.queryParamMap?.get('entity')
    this.stage = 'checking'
    this.loader = true
    this.certificateService.verifyCertificate(id, entity).subscribe(
      (response: ICertificateVerifyResponse) => this.handleVerifyResponse(response),
      (error: any) => {
        // 400 = not a certificate id at all. Anything else (RC unreachable) must not be
        // reported as invalid: fall back to the access code, which still works.
        this.stage = get(error, 'status') === 400 ? 'invalid' : 'code'
        this.loader = false
        this.cdr.detectChanges()
      },
    )
  }

  private handleVerifyResponse(response: ICertificateVerifyResponse) {
    const certificate = response?.found ? response.certificate : undefined
    if (certificate && !certificate.revoked) {
      this.showRcCertificate(certificate, response.printUri)
    } else if (certificate) {
      this.stage = 'invalid'
    } else {
      this.stage = this.migrationCompleted ? 'invalid' : 'code'
    }
    this.loader = false
    this.cdr.detectChanges()
  }

  private showRcCertificate(certificate: IVerifiedCertificate, printUri?: string) {
    this.recipient = certificate.recipientName
    this.courseName = certificate.courseName
    this.issuedOn = this.formatIssuedOn(certificate.issuedOn)
    // issuer.name is not shown: batch cert templates carry a placeholder ("in"), sealed into
    // every signed certificate. The certificate image shows the real issuer.
    this.maskedEmail = ''
    this.maskedPhone = ''
    if (printUri) {
      // printUri is raw SVG for RC certificates: never bind it directly (see SafeResourceUrlService).
      const src = this.safeResourceUrlSvc.toImageSource(printUri, this.objectUrls)
      this.certificateImage = this.safeResourceUrlSvc.trustImageSrc(src)
    }
    this.viewCertificate = true
    this.stage = 'verified'
  }

  /** Course certificates already carry the printed date; event and older records a timestamp. */
  private formatIssuedOn(value: string): string {
    return /^\d{4}-\d{2}-\d{2}/.test(value || '') ? moment(value).format('DD MMM YYYY') : value || ''
  }

  /** It will call the validate cert. api and course_details api (after taking courseId) */
  certificateVerify() {
    this.loader = true
    const request = {
      certId: this.activatedRoute.snapshot.params.uuid,
      accessCode: trim(this.certificateCode),
    }
    this.certificateService.validateCertificate(request).subscribe(
      (data: any) => {
        const certData = get(data, 'response.json')
        this.loader = false
        this.viewCertificate = true
        this.stage = 'verified'
        this.recipient = get(certData, 'recipient.name')
        this.courseName = get(certData, 'badge.name')
        this.issuedOn = moment(new Date(get(certData, 'issuedOn'))).format('DD MMM YYYY')
        this.maskedEmail = get(data, 'maskedEmail') || ''
        this.maskedPhone = get(data, 'maskedPhone') || ''
        this.cdr.detectChanges()
      },
      () => {
        this.wrongCertificateCode = true
        this.loader = false
        this.codeInputField.nativeElement.value = ''
        this.codeInputField.nativeElement.focus()
        this.enableVerifyButton = false
        this.cdr.detectChanges()
      }
    )
  }
  /** To handle verify button enable/disable fucntionality */
  getCodeLength(event: any) {
    this.wrongCertificateCode = false
    if (event.target.value.length === 6) {
      this.enableVerifyButton = true
    } else {
      this.enableVerifyButton = false
    }
  }
  getCourseVideoUrl(courseId: string) {
    this.getCollectionHierarchy(courseId).subscribe(
      (response: any) => {
        this.watchVideoLink = get(response, 'result.content.certVideoUrl')
        if (this.watchVideoLink) {
          const splitedData = this.watchVideoLink.split('/')
          splitedData.forEach(value => {
            if (value.includes('do_')) {
              this.contentId = value
            }
          })
        }
      },
      (error: any) => {
        if (error) {
          // can do something here
        }
      })
  }
  public getCollectionHierarchy(identifier: string, option?: any): Observable<any> {
    const req = {
      url: `${this.urls.HIERARCHY}/${identifier}`,
      param: option?.params ?? {},
    }
    return this.apiService.get(req.url, req.param).pipe(map((response: any) => {
      this.collectionData = response.result.content
      return response
    }))
  }

}

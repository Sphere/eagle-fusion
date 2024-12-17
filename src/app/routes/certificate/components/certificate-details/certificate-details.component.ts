import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import trim from 'lodash/trim'
import get from 'lodash/get'
import upperCase from 'lodash/upperCase'

import moment from 'moment'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ConfigurationsService } from '@ws-widget/utils'
import { ApiService } from '@ws/author/src/public-api'
import { CertificateService } from '../../services/certificate.service'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
// import { IImpressionEventInput,  } from '@project-sunbird/telemetry-sdk'

@Component({
  selector: 'app-certificate-details',
  templateUrl: './certificate-details.component.html',
  styleUrls: ['./certificate-details.component.scss'],
})
export class CertificateDetailsComponent implements OnInit {
  appIcon: SafeUrl | null = null
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
  watchVideoLink!: string
  urls = {
    HIERARCHY: 'course/v1/hierarchy',
    LEARNER_PREFIX: '/learner/',
  }
  @ViewChild('codeInputField', { static: false }) codeInputField!: ElementRef

  constructor(
    public activatedRoute: ActivatedRoute,
    public certificateService: CertificateService,
    public configService: ConfigurationsService,
    private domSanitizer: DomSanitizer,
    public apiService: ApiService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.instance = upperCase(this.configService.rootOrg || 'aastrika')
    if (this.configService.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configService.instanceConfig.logos.appTransparent,
      )
    }
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
        // this.getCourseVideoUrl(get(data, 'result.response.courseId'))
        const certData = get(data, 'response.json')
        this.loader = false
        this.viewCertificate = true
        this.recipient = get(certData, 'recipient.name')
        this.courseName = get(certData, 'badge.name')
        this.issuedOn = moment(new Date(get(certData, 'issuedOn'))).format('DD MMM YYYY')
      },
      () => {
        this.wrongCertificateCode = true
        this.loader = false
        this.codeInputField.nativeElement.value = ''
        this.codeInputField.nativeElement.focus()
        this.enableVerifyButton = false
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
  /** To redirect to courses tab (for mobile device, they will handle 'href' change) */
  navigateToCoursesPage() {
    if (this.activatedRoute.snapshot.queryParams.clientId === 'android') {
      window.location.href = '/page/learn'
    } else {
      this.router.navigate(['/page/learn'])
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
  public getCollectionHierarchy(identifier: string, option: any = { params: {} }): Observable<any> {
    const req = {
      url: `${this.urls.HIERARCHY}/${identifier}`,
      param: option.params,
    }
    return this.apiService.get(req.url, req.param).pipe(map((response: any) => {
      this.collectionData = response.result.content
      return response
    }))
  }

}

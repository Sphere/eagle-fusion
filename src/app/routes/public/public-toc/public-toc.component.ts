import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { find, includes } from 'lodash'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { OrgServiceService } from '../../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { combineLatest } from 'rxjs'
import { LoggerService } from '../../../../../library/ws-widget/utils/src/public-api'
import { SeoService } from '../../../services/seo.service'

@Component({
    standalone: false,
    selector: 'ws-public-toc',
    templateUrl: './public-toc.component.html',
    styleUrls: ['./public-toc.component.scss'],
    
})
export class PublicTocComponent implements OnInit, OnDestroy {
  tocData: any
  routelinK = 'overview'
  courseid: any
  isLoading = false
  constructor(
    private router: Router,
    private orgService: OrgServiceService,
    private activeRoute: ActivatedRoute,
    private userProfileSvc: UserProfileService,
    private seoSvc: SeoService,
    private logger: LoggerService,
    private cdr: ChangeDetectorRef
  ) {}
  async ngOnInit() {
    // Wait for child route if any
    const childRoute = this.activeRoute.firstChild || this.activeRoute

    // Subscribe to both params and queryParams
    combineLatest([
      childRoute.params,
      childRoute.queryParams,
    ]).subscribe(async ([params, queryParams]) => {
      const courseId = params['courseId'] || queryParams['courseId']
      const slug = params['slug'] || params['courseId'] || ''

      this.courseid = courseId
      this.logger.log('this.courseId', this.courseid)

      try {
        (window as any).fbq('track', 'ViewContent', {
          contentId: this.courseid,
          content_category: 'Public TOC',
        })
      } catch (e) {
        this.logger.log("fb pixel error")
      }

      // User UUID flow
      if (localStorage.getItem('userUUID')) {
        this.isLoading = true
        const id = localStorage.getItem('userUUID') || ''

        this.userProfileSvc.getUserdetailsFromRegistry(id).subscribe(
          async (_data: any) => {
            const redirectPath = `/public/toc/overview/${this.courseid}/${slug}`

            // Only redirect if needed (compare against current router URL path)
            if (this.router.url !== redirectPath) {
              this.router.navigateByUrl(redirectPath)
            }
            Promise.resolve().then(() => { this.isLoading = false; this.cdr.markForCheck() })
          },
          err => {
            this.logger.error(err)
            Promise.resolve().then(() => { this.isLoading = false; this.cdr.markForCheck() })
          }
        )
      }

      // Load TOC
      if (localStorage.getItem('tocData')) {
        localStorage.removeItem('tocData')
      }

      if (!this.tocData) {
        await this.seachAPI(this.courseid)
      }

      this.checkRoute()
    })
  }



  checkRoute() {
    if (includes(this.router.url, 'overview')) {
      this.toggleComponent('overview')
    } else if (includes(this.router.url, 'contents')) {
      this.toggleComponent('contents')
    } else {
      this.toggleComponent('license')
    }
  }
  toggleComponent(cname: string) {
    this.routelinK = ''
    if (cname === 'overview') {
      this.routelinK = 'overview'
    } else if (cname === 'contents') {
      this.routelinK = 'contents'
    } else if (cname === 'license') {
      this.routelinK = 'license'
    }
  }
  seachAPI(id: any) {
    this.orgService.getSearchResultsById(id).subscribe((res: any) => {
      if (res) {
        find(res.result.content
          , findRes => {
            if (findRes.identifier === id) {
              this.tocData = findRes
              this.cdr.detectChanges()
              this.logger.log('findRes', findRes)

              const courseUrl = `https://sphere.aastrika.org${this.router.url.split('?')[0]}`
              const description = this.tocData?.description ||
                'Begin your journey to mastering pregnancy, childbirth, AMTSL & newborn care. Get 7.5 CNE credits & INC certification after each module.'
              const keywords = `${this.tocData?.name}, AMTSL, childbirth, newborn care, maternal health, pregnancy, INC certificate, CNE credits, Aastrika Sphere`

              this.seoSvc.update({
                title: `${this.tocData?.name} | Aastrika Sphere`,
                description,
                keywords,
                ogType: 'article',
                ogUrl: courseUrl,
                ogImage: this.tocData?.appIcon || this.tocData?.posterImage,
                canonicalUrl: courseUrl,
                jsonLd: {
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': this.tocData?.name,
                  'description': description,
                  'url': courseUrl,
                  'provider': {
                    '@type': 'Organization',
                    'name': 'Aastrika Sphere',
                    'sameAs': 'https://sphere.aastrika.org',
                  },
                },
              })

              localStorage.setItem('tocData', JSON.stringify(this.tocData))
              localStorage.setItem(`url_before_login`, `app/toc/` + `${id}` + `/overview`)
            }

          })
        return this.tocData
      }
    })
    return this.tocData
  }
  ngOnDestroy() {

  }
}

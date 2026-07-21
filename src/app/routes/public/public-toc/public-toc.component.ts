import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { find, includes } from 'lodash'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { OrgServiceService } from '../../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { combineLatest, firstValueFrom } from 'rxjs'
import { LoggerService } from '../../../../../library/ws-widget/utils/src/public-api'
import { SeoService } from '../../../services/seo.service'
import { UserAgentResolverService } from '../../../services/user-agent.service'

@Component({
  standalone: false,
  selector: 'ws-public-toc',
  templateUrl: './public-toc.component.html',
  styleUrls: ['./public-toc.component.scss'],

})
export class PublicTocComponent implements OnInit {
  tocData: any
  routelinK = 'overview'
  courseid: any
  isLoading = false
  constructor(
    private readonly router: Router,
    private readonly orgService: OrgServiceService,
    private readonly activeRoute: ActivatedRoute,
    private readonly userProfileSvc: UserProfileService,
    private readonly seoSvc: SeoService,
    private readonly logger: LoggerService,
    private readonly cdr: ChangeDetectorRef,
    private readonly userAgentSvc: UserAgentResolverService,
  ) { }
  ngOnInit() {
    this.initializeToc()
  }

  private initializeToc(): void {
    this.userAgentSvc.requestGeolocation()
    // Wait for child route if any
    const childRoute = this.activeRoute.firstChild || this.activeRoute

    // Subscribe to both params and queryParams
    combineLatest([
      childRoute.params,
      childRoute.queryParams,
    ]).subscribe(([params, queryParams]) => {
      this.handleTocRouteParams(params, queryParams)
    })
  }

  private handleTocRouteParams(params: any, queryParams: any): void {
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
        (_data: any) => {
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
      this.seachAPI(this.courseid)
    } else {
      this.checkRoute()
    }
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
  async seachAPI(id: any): Promise<any> {
    try {
      const res = await firstValueFrom(this.orgService.getSearchResultsV7ById(id))
      if (res) {
        const found = find(res.result.content, (c: any) => c.identifier === id)
        if (found) {
          this.tocData = found
          // Sunbird content/v1/search returns the rating count as totalNumberOfRatings;
          // map it onto totalRatingsCount, which the SEO JSON-LD consumes.
          this.tocData.totalRatingsCount ??= this.tocData.totalNumberOfRatings
          this.cdr.detectChanges()
          this.logger.log('findRes', found)

          const courseUrl = `https://sphere.aastrika.org${this.router.url.split('?')[0]}`
          const description = (this.tocData?.description || this.tocData?.name || '')
            .replace(/<[^>]*>/g, '')
            .slice(0, 160)
            .trim()

          const subjectArr: string[] = Array.isArray(this.tocData?.subject)
            ? this.tocData.subject
            : (this.tocData?.subject ? [this.tocData.subject] : [])
          const keywordArr: string[] = Array.isArray(this.tocData?.keywords)
            ? this.tocData.keywords
            : (this.tocData?.keywords ? String(this.tocData.keywords).split(',').map((k: string) => k.trim()) : [])
          const keywords = [
            this.tocData?.name,
            ...subjectArr,
            ...keywordArr,
            this.tocData?.sourceName,
            'INC certificate',
            'CNE credits',
            'Aastrika Sphere',
          ].filter(Boolean).join(', ')

          const providerName = this.tocData?.sourceName || 'Aastrika Sphere'

          this.seoSvc.update({
            title: `${this.tocData?.name} | Free INC Course — ${providerName} | Aastrika Sphere`,
            description: description
              ? `${description} — Free INC-certified course by ${providerName}. Earn CNE points. No fees, no deadline.`.slice(0, 260)
              : `${this.tocData?.name} — Free INC-certified online course by ${providerName} on Aastrika Sphere. Earn CNE points. No fees, no deadline.`,
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
                'name': providerName,
                'sameAs': 'https://sphere.aastrika.org',
              },
              ...(this.tocData?.averageRating ? {
                'aggregateRating': {
                  '@type': 'AggregateRating',
                  'ratingValue': this.tocData.averageRating,
                  'bestRating': 5,
                  'ratingCount': this.tocData.totalRatingsCount || 1,
                },
              } : {}),
            },
          })

          localStorage.setItem('tocData', JSON.stringify(this.tocData))
          localStorage.setItem(`url_before_login`, `app/toc/${id}/overview`)
        }
      }
    } catch (e) {
      this.logger.error(e)
    }
    return this.tocData
  }
}

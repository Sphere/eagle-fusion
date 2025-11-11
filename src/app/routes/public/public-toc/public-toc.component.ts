import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { find, includes } from 'lodash'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { OrgServiceService } from '../../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { Meta, Title } from '@angular/platform-browser'
import { combineLatest } from 'rxjs'

@Component({
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
    private meta: Meta, private title: Title
  ) {

  }
  async ngOnInit() {
    // Wait for child route if any
    const childRoute = this.activeRoute.firstChild || this.activeRoute

    // Subscribe to both params and queryParams
    combineLatest([
      childRoute.params,
      childRoute.queryParams
    ]).subscribe(async ([params, queryParams]) => {
      const courseId = params['courseId'] || queryParams['courseId']
      const slug = params['slug'] || params['courseId'] || ''

      this.courseid = courseId
      console.log('this.courseId', this.courseid)

      try {
        (window as any).fbq('track', 'ViewContent', {
          contentId: this.courseid,
          content_category: 'Public TOC'
        })
      } catch (e) {
        console.log("fb pixel error")
      }

      // User UUID flow
      if (localStorage.getItem('userUUID')) {
        this.isLoading = true
        const id = localStorage.getItem('userUUID') || ''

        this.userProfileSvc.getUserdetailsFromRegistry(id).subscribe(
          async (data: any) => {
            const lang = data?.unMappedUser?.profileDetails?.preferences?.language
              ?? (location.href.includes('/hi/') ? 'hi' : 'en')

            let baseUrl = `${document.baseURI}`
            if (baseUrl.includes('/hi/')) {
              baseUrl = baseUrl.replace(/hi\//g, '')
            }

            const langPrefix = lang === 'hi' ? 'hi/' : ''
            const redirectUrl = `${baseUrl}${langPrefix}public/toc/overview/${this.courseid}/${slug}`

            // Only redirect if needed
            if (window.location.href !== redirectUrl) {
              this.router.navigateByUrl(redirectUrl)
            }
            // location.href = redirectUrl
            this.isLoading = false
          },
          err => {
            console.error(err)
            this.isLoading = false
          }
        )
      }

      // Load TOC
      if (localStorage.getItem('tocData')) {
        localStorage.removeItem('tocData')
      }

      if (!this.tocData) {
        await this.seachAPI(this.courseid)
        this.title.setTitle('Aastrika Sphere - ' + this.tocData?.name)
        this.meta.updateTag({ name: 'description', content: this.tocData?.description })
        this.meta.updateTag({ name: 'keywords', content: this.tocData?.name })
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
              console.log('findRes', findRes)
              this.title.setTitle(`${this.tocData?.name} | Aastrika Sphere`)

              this.meta.updateTag({
                name: 'description',
                content: `Begin your journey to mastering pregnancy, childbirth, AMTSL & newborn care. Get 7.5 CNE credits & INC certification after each module.`
              })

              this.meta.updateTag({
                name: 'keywords',
                content: `${this.tocData?.name}, AMTSL, childbirth, newborn care, maternal health, pregnancy, INC certificate, CNE credits, Aastrika Sphere`
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

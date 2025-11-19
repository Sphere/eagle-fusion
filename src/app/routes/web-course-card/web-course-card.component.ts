import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'
import { delay, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { SignupService } from '../signup/signup.service'
import { get, forEach } from 'lodash'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'ws-web-course-card',
  templateUrl: './web-course-card.component.html',
  styleUrls: ['./web-course-card.component.scss'],
})
export class WebCourseCardComponent implements OnInit {
  isUserLoggedIn = false
  @Input() widgetData!: any
  @Input() cnePoints: any = false
  @Input() courseData: any
  @Input() enableConfig = false
  @Input() displayConfig = {
    displayType: 'card-badges',
    badges: {
      orgIcon: true,
      certification: true,
      sourceName: true,
      rating: true,
      cnePoints: true,
      cneName: true,
    },
  }
  displayStyle = 'none'
  isLoggedIn = false
  constructor(private router: Router,
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private signUpSvc: SignupService,
    private titleService: Title
  ) { }
  cometencyData: { name: any; levels: string }[] = []
  ngOnInit() {
    // console.log("this.courseData", this.courseData, this.displayConfig)
    if (localStorage.getItem('loginbtn') || localStorage.getItem('url_before_login')) {
      this.isUserLoggedIn = true
    } else {
      this.isUserLoggedIn = false
    }
    if (this.configSvc.userProfile) {
      this.isLoggedIn = true
    } else {
      this.isLoggedIn = false
    }

    if (this.courseData && this.courseData.competencies_v1 && Object.keys(this.courseData.competencies_v1).length > 0) {

      forEach(JSON.parse(this.courseData.competencies_v1), (value: any) => {
        if (value.level) {
          this.cometencyData.push(
            {
              name: value.competencyName,
              levels: ` Level ${value.level}`,
            }
          )
        }
        return this.cometencyData
      })
    }
  }
  clickToRedirect(data: any) {
    if (this.configSvc.userProfile === null) {
      localStorage.setItem(`url_before_login`, `app/toc/` + `${data.identifier}` + `/overview`)
      const url = localStorage.getItem(`url_before_login`) || ''
      this.router.navigateByUrl(url)
    } else {
      this.raiseTelemetry(data)
    }

  }
  raiseTelemetry(data: any) {
    if (this.configSvc.unMappedUser) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(delay(50), mergeMap((data: any) => {
        return of(data)
      })).subscribe((userDetails: any) => {
        if (this.userProfileSvc.isBackgroundDetailsFilled(get(userDetails, 'profileDetails.profileReq'))) {
          // this.events.raiseInteractTelemetry('click', `${this.widgetType}-${this.widgetSubType}`, {
          //   contentId: this.widgetData.content.identifier,
          //   contentType: this.widgetData.content.contentType,
          //   context: this.widgetData.context,
          // })
          this.router.navigateByUrl(`/app/toc/${data.identifier}/overview?primaryCategory=Course`)
        } else {
          const url = `/app/toc/${data.identifier}/overview`
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: url } })
        }
      })
    }
  }
  login(data: any) {
    const name = `${data.name} - Aastrika`
    this.titleService.setTitle(name)

    const slug = this.slugify(data.name)
    const courseId = data.identifier

    this.router.navigate(['/public/toc/overview', courseId, slug], {
      state: {
        tocData: data,
      },
    })

    localStorage.setItem('tocData', JSON.stringify(data))
    localStorage.setItem(`url_before_login`, `app/toc/${courseId}/overview`)
  }

  // Helper function to slugify the course name
  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')   // Replace spaces/symbols with hyphen
      .replace(/^-+|-+$/g, '')       // Remove starting/ending hyphens
  }


  redirectPage(course: any) {
    if (this.isLoggedIn) {
      console.log('yes here')
      this.navigateToToc(course.identifier)
    } else {
      console.log('else')
      const currentRoute = this.router.url

      if (currentRoute.includes('org-selective-course')) {
        const url = `app/toc/` + `${course.identifier}` + `/overview`
        localStorage.setItem(`url_before_login`, url)
        this.showPopup()
      } else {
        this.login(course)
      }
    }
  }

  showPopup() {
    this.displayStyle = 'block'
  }
  closePopup() {
    this.displayStyle = 'none'
  }
  orgLogin() {
    this.router.navigateByUrl('public/login')
  }
  orgCreateAccount() {
    const cachedOrgConfig = this.configSvc.orgSelectiveCourseConfig
    const urlParams = new URLSearchParams(window.location.search)
    const orgNameFromUrl = urlParams.get('org')?.trim()

    // If no org data available, stay safe
    if (!cachedOrgConfig && !orgNameFromUrl) {
      console.warn('No organization data found for signup')
      this.router.navigateByUrl('/app/create-account')
      return
    }

    // Determine state code and org name
    const stateCode = cachedOrgConfig?.stateCode || 'TN'
    const orgName = cachedOrgConfig?.orgName || orgNameFromUrl || 'UnknownOrg'

    // Determine user role (can also come from org config if needed)
    const role = cachedOrgConfig?.signupRole || 'TNNMC-Student'

    // Construct dynamic URL
    const path = `/app/create-account/${encodeURIComponent(stateCode)}/${encodeURIComponent(orgName)}/${encodeURIComponent(role)}`

    console.log('Navigating to:', path)
    this.router.navigateByUrl(path)

  }
  // For opening Course Page
  navigateToToc(contentIdentifier: any) {
    const url = `app/toc/${contentIdentifier}/overview`
    if (this.configSvc.userProfile === null) {
      this.signUpSvc.keyClockLogin()
      localStorage.setItem(`url_before_login`, url)
      this.router.navigateByUrl('app/login')
    } else {
      if (this.configSvc.unMappedUser) {
        this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id)
          .pipe(delay(500))
          .subscribe((userDetails: any) => {
            const profileReq = get(userDetails, 'profileDetails.profileReq')
            console.log('USER DETAILS FROM REGISTRY:', userDetails) // ← Add this
            console.log('Profile Req:', profileReq) // ← Add this

            if (this.userProfileSvc.isBackgroundDetailsFilled(profileReq)) {
              this.router.navigateByUrl(url)
            } else {
              console.log('Background details not filled, redirecting to about-you')
              const courseUrl = `/app/toc/${contentIdentifier}/overview`
              this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
            }
          })
      }
    }
  }
}

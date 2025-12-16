import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'
import { delay, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { SignupService } from '../signup/signup.service'
import { forEach, get } from 'lodash'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'ws-mobile-course-view',
  templateUrl: './mobile-course-view.component.html',
  styleUrls: ['./mobile-course-view.component.scss'],
})
export class MobileCourseViewComponent implements OnInit {

  @Input() courseData: any = {};
  @Input() cnePoints: any = false

  @Input() enableConfig = false
  isLoggedIn = false
  displayStyle = 'none'
  @Input()
  displayConfig = {
    displayType: 'card-badges',
    badges: {
      orgIcon: true,
      certification: true,
    },
  }
  constructor(public router: Router,
    public configSvc: ConfigurationsService,
    public userProfileSvc: UserProfileService,
    public signUpSvc: SignupService,
    public titleService: Title
  ) { }
  cometencyData: { name: any; levels: string }[] = []
  ngOnInit() {
    // console.log("this.courseData", this.courseData, this.displayConfig)

    if (this.configSvc.userProfile) {
      if (sessionStorage.getItem('cURL')) {
        sessionStorage.removeItem('cURL')
      }
      this.isLoggedIn = true
    } else {
      this.isLoggedIn = false
    }
    if (this.courseData.competencies_v1 && Object.keys(this.courseData.competencies_v1).length > 0) {

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
    localStorage.setItem(`url_before_login`, `app/toc/` + `${data.identifier}` + `/overview`)
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
      this.navigateToToc(course.identifier)
    } else {
      const currentRoute = this.router.url
      localStorage.setItem('tocData', JSON.stringify(course))
      localStorage.setItem(`url_before_login`, `app/toc/` + `${course.identifier}` + `/overview`)
      if (currentRoute.includes('org-selective-course')) {
        this.showPopup()
      } else {
        this.login(course)
      }
    }
  }

  // For opening Course Page
  navigateToToc(contentIdentifier: any) {
    // this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`)
    const url = `app/toc/` + `${contentIdentifier}` + `/overview`
    if (this.configSvc.userProfile === null) {
      this.signUpSvc.keyClockLogin()
      // localStorage.setItem(`url_before_login`, url)
      // this.router.navigateByUrl('app/login')
    } else {
      if (this.configSvc.unMappedUser) {
        sessionStorage.setItem('cURL', location.href)
        this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(delay(500), mergeMap((data: any) => {
          return of(data)
        })).subscribe((userDetails: any) => {
          if (this.userProfileSvc.isBackgroundDetailsFilled(get(userDetails, 'profileDetails.profileReq'))) {

            // location.href = url
            this.router.navigateByUrl(url)
          } else {
            const courseUrl = `/app/toc/${contentIdentifier}/overview`
            this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
          }
        })
      }
    }

  }
}

import { AuthKeycloakService } from '@ws-widget/utils'
import { OrgServiceService } from './../../org-service.service'
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router, Data } from '@angular/router'
import { MdePopoverTrigger } from '@material-extended/mde'
@Component({
  selector: 'ws-app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.scss'],
})
export class OrgComponent implements OnInit, OnDestroy {
  @ViewChild('target', { static: false }) target!: MdePopoverTrigger
  orgName: any
  courseData!: any
  routeSubscription: any
  orgData: any
  currentOrgData: any
  showEndPopup = false
  btnText = ''

  constructor(private activateRoute: ActivatedRoute, private orgService: OrgServiceService,
              private router: Router, private authSvc: AuthKeycloakService) { }

  ngOnInit() {
    this.orgName = this.activateRoute.snapshot.queryParams.orgId
    if (this.orgName === 'Indian Nursing Council') {
      this.orgService.hideHeaderFooter.next(true)
    }
    this.routeSubscription = this.activateRoute.data.subscribe((response: Data) => {
      const currentOrg = this.orgName
      if (response.orgData) {
        this.orgData = response.orgData.data.sources
        this.currentOrgData = this.orgData.filter(
          (org: any) => org.sourceName === currentOrg
        )
        if (this.currentOrgData) {
          this.currentOrgData = this.currentOrgData[0]
        }
      }
    })
    const req = {
      orgId: [this.orgName],
      searchFilters: {
        locale: [
          'en',
        ],
        pageSize: 5,
        query: 'all',
        didYouMean: true,
        filters: [
          {
            andFilters: [
              {
                contentType: [
                  'Course',
                  'Program',
                ],
              },
            ],
          },
        ],
        visibleFilters: {
          learningMode: {
            displayName: 'Mode',
          },
          duration: {
            displayName: 'Duration',
          },
          exclusiveContent: {
            displayName: 'Costs',
          },
          complexityLevel: {
            displayName: 'Level',
          },
          catalogPaths: {
            displayName: 'Catalog',
            order: [
              {
                _key: 'asc',
              },
            ],
          },
          sourceShortName: {
            displayName: 'Source',
          },
          resourceType: {
            displayName: 'Format',
          },
          region: {
            displayName: 'Region',
          },
          concepts: {
            displayName: 'Concepts',
          },
          lastUpdatedOn: {
            displayName: 'Published Date',
          },
        },
        includeSourceFields: [
          'creatorLogo',
        ],
        sort: [
          {
            lastUpdatedOn: 'desc',
          },
        ],
      },
    }
    this.orgService.getDatabyOrgId(req).subscribe(data => {
      this.courseData = data
    })
    this.authSvc.isAuthenticated ? this.btnText = 'View Course' : this.btnText = 'Login'

  }

  gotoOverview(identifier: any) {
    if (this.authSvc.isAuthenticated) {
      this.router.navigate([`/app/toc/${identifier}/overview`])
    } else {
      this.authSvc.login('S', `${document.baseURI}/app/toc/${identifier}/overview`)
    }
  }

  showMoreCourses() {
    this.router.navigate(['/app/org-details/all-courses'], { queryParams: { orgId: this.orgName } })
  }

  goToProfile(id: string) {
    this.router.navigate(['/app/person-profile'], { queryParams: { userId: id } })
  }
  showTarget(event: any) {
    if (window.innerWidth - event.clientX < 483) {
      this.showEndPopup = true
      this.target.targetOffsetX = event.clientX + 1
    } else {
      // console.log('this.showEndPopup', this.showEndPopup)
    }
  }
  loginRedirect(key: 'E' | 'N' | 'S', contentId: any) {
    const url = `/app/toc/${contentId}/overview`
    this.authSvc.login(key, url)
  }
  ngOnDestroy() {
    this.orgService.hideHeaderFooter.next(false)
  }
}

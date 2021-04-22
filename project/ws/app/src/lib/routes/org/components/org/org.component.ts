import { AuthKeycloakService } from '@ws-widget/utils'
import { OrgServiceService } from './../../org-service.service'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router, Data } from '@angular/router'

@Component({
  selector: 'ws-app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.scss'],
})
export class OrgComponent implements OnInit {
  orgName: any
  courseData!: any
  routeSubscription: any
  orgData: any
  currentOrgData: any

  constructor(private activateRoute: ActivatedRoute, private orgService: OrgServiceService,
              private router: Router, private authSvc: AuthKeycloakService) { }

  ngOnInit() {
    this.orgName = this.activateRoute.snapshot.queryParams.orgId
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
  }

  gotoOverview(identifier: any) {
    if (this.authSvc.isAuthenticated) {
      this.router.navigate([`/app/toc/${identifier}/overview`])
    } else {
      this.authSvc.login('S', document.URL)
    }
  }

  showMoreCourses() {
    this.router.navigate(['/app/org-details/all-courses'], { queryParams: { orgId: this.orgName } })
  }

  goToProfile(id: string) {
    this.router.navigate(['/app/person-profile'], { queryParams: { userId: id } })
  }
}

import { Component, Input, OnInit } from '@angular/core'
import { NsContent, NsAutoComplete } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils'
import { NsCohorts } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
import { Router, ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-app-toc-cohorts',
  templateUrl: './app-toc-cohorts.component.html',
  styleUrls: ['./app-toc-cohorts.component.scss'],
})
export class AppTocCohortsComponent implements OnInit {
  @Input() content!: NsContent.IContent
  cohortResults: {
    [key: string]: { hasError: boolean; contents: NsCohorts.ICohortsContent[] }
  } = {}
  cohortTypesEnum = NsCohorts.ECohortTypes
  @Input() forPreview = false
  identifier: any

  constructor(
    private tocSvc: AppTocService,
    private configSvc: ConfigurationsService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.identifier = params['id']
    })
    if (this.identifier === undefined) {
      this.identifier = this.content.identifier
    }
    this.fetchCohorts(this.cohortTypesEnum.ACTIVE_USERS)
  }

  public get enableFeature(): boolean {
    if (this.configSvc.restrictedFeatures) {
      return !this.configSvc.restrictedFeatures.has('cohorts')
    }
    return false
  }

  public get enablePeopleSearch(): boolean {
    if (this.configSvc.restrictedFeatures) {
      return !this.configSvc.restrictedFeatures.has('peopleSearch')
    }
    return false
  }

  goToUserProfile(user: NsAutoComplete.IUserAutoComplete) {
    if (this.enablePeopleSearch) {
      this.router.navigate(['/app/person-profile'], { queryParams: { userId: user.user_id } })
    }
  }

  fetchCohorts(cohortType: NsCohorts.ECohortTypes) {
    if (!this.cohortResults[cohortType] && !this.forPreview) {
      this.tocSvc.fetchContentCohorts(cohortType, this.identifier).subscribe(
        data => {
          this.cohortResults[cohortType] = {
            contents: data || [],
            hasError: false,
          }
        },
        () => {
          this.cohortResults[cohortType] = {
            contents: [],
            hasError: true,
          }
        },
      )
    } else if (this.cohortResults[cohortType] && !this.forPreview) {
      return
    } else {
      this.cohortResults[cohortType] = {
        contents: [],
        hasError: false,
      }
    }
  }
}

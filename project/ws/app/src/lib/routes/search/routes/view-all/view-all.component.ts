import { Component, effect, OnInit } from '@angular/core'
import { filter, includes, uniqBy } from 'lodash'
import { OrgServiceService } from '../../../org/org-service.service'
import { ValueService, ConfigurationsService, LoggerService } from '@ws-widget/utils'
import { ActivatedRoute } from '@angular/router'
import { PlaylistService } from '../../../../../../../../../src/app/services/playlist.service'
import { LanguageService } from '../../../../../../../../../src/app/services/language.service'

@Component({
  selector: 'ws-app-view-all',
  templateUrl: './view-all.component.html',
  styleUrls: ['./view-all.component.scss'],
})
export class ViewAllComponent implements OnInit {
  courseType: string | null = null
  topCertifiedCourseIdentifier: any = []
  cneCoursesIdentifier: any = []
  topCertifiedCourse: any = []
  cneCourse: any = []
  isXSmall$ = false
  resultsDisplayType: 'basic' | 'advanced' = 'advanced'
  searchResults!: any
  searchRequestStatus = 'none'
  plyLsData: any
  identifiers: any = []
  constructor(
    private readonly orgService: OrgServiceService,
    private readonly valueSvc: ValueService,
    private readonly route: ActivatedRoute,
    private readonly configSvc: ConfigurationsService,
    private playlistSvc: PlaylistService,
    private langSvc: LanguageService,
    private logger: LoggerService
  ) {
    effect(() => {
      this.isXSmall$ = this.valueSvc.isMobile() ? true : false
    })
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.courseType = params['courseType'] || 'defaultCourseType' // Use a default if needed
      this.identifiers = params['data']
      this.logger.log('Course Type:', this.courseType)
      this.searchRequestStatus = 'fetching'
      if (this.configSvc?.userProfile?.rootOrgId)
        this.plyLsData = await this.playlistSvc.getPlaylistConfig()
      this.fetchEnvironmentConfigurations()
    })
  }

  formatTopCertifiedCourseResponse(res: any) {
    const topCertifiedCourse = filter(res.result.content, ckey => {
      return includes(this.topCertifiedCourseIdentifier, ckey.identifier)
    })
    this.searchResults = uniqBy(topCertifiedCourse, 'identifier')
    this.logger.log("searchResults:", this.searchResults)
  }

  fetchEnvironmentConfigurations() {
    const identifiers = []
    this.plyLsData?.forEach(async (element: any) => {
      if (element.orgId == this.configSvc.userProfile.rootOrgId && element.language == this.langSvc.getCurrentLanguage()) {
        if (this.courseType === 'topCourse' && element.playlistId === "TOP_COURSE_PLAYLIST") {
          this.topCertifiedCourseIdentifier = []
          this.topCertifiedCourseIdentifier = element.dataSource.payload
          identifiers.push(...element.dataSource.payload)
        }
        if (this.courseType === "cneCourses" && element.playlistId === "CNE_COURSE_PLAYLIST") {
          this.cneCoursesIdentifier = []
          this.cneCoursesIdentifier = element.dataSource.payload
          identifiers.push(...element.dataSource.payload)
        }
      }
      this.orgService
        .getTopLiveSearchResults(identifiers, this.langSvc.getCurrentLanguage())
        .subscribe((results: any) => {
          const content = results?.result?.content || []
          if (content?.length > 0) {
            if (this.courseType === 'topCourse') {
              this.searchRequestStatus = 'done'
              this.formatTopCertifiedCourseResponse(results)
            } else {
              this.searchRequestStatus = 'done'
              this.formatcneCourseResponse(results)
            }
          }
        })
    })
    if (!this.configSvc?.userProfile?.rootOrgId) {
      if (this.identifiers?.length > 0) {
        this.orgService
          .getTopLiveSearchResults(this.identifiers, this.langSvc.getCurrentLanguage())
          .subscribe((results: any) => {
            const content = results?.result?.content || []
            if (content?.length > 0) {
              if (this.courseType === 'topCourse') {
                this.topCertifiedCourseIdentifier = []
                this.topCertifiedCourseIdentifier = this.identifiers
                this.searchRequestStatus = 'done'
                this.formatTopCertifiedCourseResponse(results)
              } else {
                this.searchRequestStatus = 'done'
                this.cneCoursesIdentifier = []
                this.cneCoursesIdentifier = this.identifiers
                this.formatcneCourseResponse(results)
              }
            }
          })
      }
    }
  }


  contentTrackBy(item: any) {
    return item.identifier
  }
  formatcneCourseResponse(res: any) {
    this.logger.log("res", res, this.cneCoursesIdentifier)
    const cneCourse = filter(res.result.content, ckey => {
      return includes(this.cneCoursesIdentifier, ckey.identifier)
    })
    this.searchResults = uniqBy(cneCourse, 'identifier')
  }

}

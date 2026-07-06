import { Component, effect, OnInit, signal } from '@angular/core'
import { filter, includes, uniqBy } from 'lodash'
import { OrgServiceService } from '../../../org/org-service.service'
import { ValueService, ConfigurationsService, LoggerService } from '@ws-widget/utils'
import { ActivatedRoute } from '@angular/router'
import { PlaylistService } from '../../../../../../../../../src/app/services/playlist.service'
import { LanguageService } from '../../../../../../../../../src/app/services/language.service'

@Component({
  standalone: false,
  selector: 'ws-app-view-all',
  templateUrl: './view-all.component.html',
  styleUrls: ['./view-all.component.scss'],

})
export class ViewAllComponent implements OnInit {
  courseType = signal<string | null>(null)
  topCertifiedCourseIdentifier = signal<any[]>([])
  cneCoursesIdentifier = signal<any[]>([])
  isXSmall$ = signal(false)
  resultsDisplayType: 'basic' | 'advanced' = 'advanced'
  searchResults = signal<any[]>([])
  searchRequestStatus = signal<'none' | 'fetching' | 'done'>('none')
  plyLsData: any
  identifiers = signal<any[]>([])
  constructor(
    private readonly orgService: OrgServiceService,
    private readonly valueSvc: ValueService,
    private readonly route: ActivatedRoute,
    private readonly configSvc: ConfigurationsService,
    private playlistSvc: PlaylistService,
    private langSvc: LanguageService,
    private logger: LoggerService,
  ) {
    effect(() => {
      this.isXSmall$.set(this.valueSvc.isMobile())
    })
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.courseType.set(params['courseType'] || 'defaultCourseType')
      const rawIdentifiers = params['data']
      this.identifiers.set(Array.isArray(rawIdentifiers)
        ? rawIdentifiers
        : rawIdentifiers ? [rawIdentifiers] : [])
      this.logger.log('Course Type:', this.courseType())
      this.searchRequestStatus.set('fetching')
      if (this.configSvc?.userProfile?.rootOrgId) {
        this.plyLsData = await this.playlistSvc.getPlaylistConfig()
      }
      this.fetchEnvironmentConfigurations()
    })
  }

  formatTopCertifiedCourseResponse(res: any) {
    const topCertifiedCourse = filter(res.result.content, ckey => {
      return includes(this.topCertifiedCourseIdentifier(), ckey.identifier)
    })
    this.searchResults.set(uniqBy(topCertifiedCourse, 'identifier'))
    this.logger.log('searchResults:', this.searchResults())
  }

  fetchEnvironmentConfigurations() {
    const identifiers: any[] = []
    this.plyLsData?.forEach((element: any) => {
      if (element.orgId === this.configSvc.userProfile.rootOrgId && element.language === this.langSvc.getCurrentLanguage()) {
        if (this.courseType() === 'topCourse' && element.playlistId === 'TOP_COURSE_PLAYLIST') {
          this.topCertifiedCourseIdentifier.set(element.dataSource.payload || [])
          identifiers.push(...(element.dataSource.payload || []))
        }
        if (this.courseType() === 'cneCourses' && element.playlistId === 'CNE_COURSE_PLAYLIST') {
          this.cneCoursesIdentifier.set(element.dataSource.payload || [])
          identifiers.push(...(element.dataSource.payload || []))
        }
      }
    })

    if (identifiers.length > 0) {
      this.orgService
        .getTopLiveSearchResults(identifiers, this.langSvc.getCurrentLanguage())
        .subscribe((results: any) => {
          const content = results?.result?.content || []
          this.searchRequestStatus.set('done')
          if (content.length > 0) {
            if (this.courseType() === 'topCourse') {
              this.formatTopCertifiedCourseResponse(results)
            } else {
              this.formatcneCourseResponse(results)
            }
          }
        })
      return
    }

    if (!this.configSvc?.userProfile?.rootOrgId && this.identifiers()?.length > 0) {
      this.orgService
        .getTopLiveSearchResults(this.identifiers(), this.langSvc.getCurrentLanguage())
        .subscribe((results: any) => {
          const content = results?.result?.content || []
          this.searchRequestStatus.set('done')
          if (content.length > 0) {
            if (this.courseType() === 'topCourse') {
              this.topCertifiedCourseIdentifier.set(this.identifiers())
              this.formatTopCertifiedCourseResponse(results)
            } else {
              this.cneCoursesIdentifier.set(this.identifiers())
              this.formatcneCourseResponse(results)
            }
          }
        })
      return
    }
    this.searchRequestStatus.set('done')
  }


  contentTrackBy(item: any) {
    return item.identifier
  }
  formatcneCourseResponse(res: any) {
    this.logger.log('res', res, this.cneCoursesIdentifier())
    const cneCourse = filter(res.result.content, ckey => {
      return includes(this.cneCoursesIdentifier(), ckey.identifier)
    })
    this.searchResults.set(uniqBy(cneCourse, 'identifier'))
  }

}

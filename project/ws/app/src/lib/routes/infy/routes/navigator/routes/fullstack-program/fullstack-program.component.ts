import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NavigatorService } from '../../services/navigator.service'
import { IFsData, IFsCardModel, IFsPlayground } from '../../models/navigator.model'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { NsContentStripMultiple } from '@ws-widget/collection'

@Component({
  selector: 'ws-app-fullstack-program',
  templateUrl: './fullstack-program.component.html',
  styleUrls: ['./fullstack-program.component.scss'],
})
export class FullstackProgramComponent implements OnInit {
  fsData: IFsData[]
  availablePlaygrounds: any[] = []
  fetchingCourses = false
  availableCertifications: any[] = []
  playground: any[] = []
  fullStackData!: IFsData
  fetchStatus: TFetchStatus = 'none'
  defaultThumbnail = ''

  playgroundData: IFsCardModel[]
  certificationData: IFsCardModel[]

  coursesResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
        {
          key: 'courses-strip',
          preWidgets: [],
          title: 'Content',
          filters: [],
          request: {
            ids: [],
          },
        },
      ],
    },
  }
  constructor(
    private route: ActivatedRoute,
    private navSvc: NavigatorService,
    private configSvc: ConfigurationsService,
  ) {
    this.fsData = []
    this.playgroundData = []
    this.certificationData = []
    this.navSvc.fetchFullStackData().subscribe((data: IFsData[]) => {
      this.fsData = data

      this.fullStackData = this.fsData.filter((fs: IFsData) => {
        return fs.fs_id === Number(this.route.snapshot.params.id)
      })[0]

      const ids = this.fullStackData.fs_course.map(course => {
        return course.course_lex_link.split('/').reverse()[0]
      })

      this.fetchContentForFs(ids)

      this.initializePracticeCertifications()

      this.fetchStatus = 'done'
    })
  }

  ngOnInit() {
    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.configSvc.instanceConfig.logos.defaultContent
    }
  }

  fetchContentForFs(ids: string[]) {
    this.coursesResolverData.widgetData.strips.forEach(strip => {
      if (strip.key === 'courses-strip' && strip.request) {
        strip.request.ids = ids
      }
    })
    this.coursesResolverData = { ...this.coursesResolverData }

  }

  initializePracticeCertifications() {
    this.fullStackData.fs_playground.forEach((playground: IFsPlayground) => {
      const playData: IFsCardModel = {
        thumbnail: '/assets/images/content-card/card_img.jpg',
        title: playground.playground_name,
        description: playground.playground_desc,
        routeButton: playground.playground_link,
        type: 'internal',
      }
      this.playgroundData.push(playData)
    })

    this.fullStackData.fs_internal_certification.forEach(fsData => {
      if (fsData.internal_certification_link !== '') {

        const certificationData: IFsCardModel = {
          thumbnail: '/assets/images/content-card/card_img.jpg',
          title: fsData.internal_certification_name,
          description: fsData.internal_certification_desc,
          routeButton: fsData.internal_certification_link,
          type: 'internal',
        }
        this.certificationData.push(certificationData)
      }
    })

    this.fullStackData.fs_external_certification.forEach(fsData => {
      if (fsData.external_certification_link !== '') {
        const certificationData: IFsCardModel = {
          thumbnail: '/assets/images/content-card/card_img.jpg',
          title: fsData.external_certification_name,
          description: fsData.external_certification_desc,
          routeButton: fsData.external_certification_link,
          type: 'external',
        }
        this.certificationData.push(certificationData)
      }
    })

  }
}

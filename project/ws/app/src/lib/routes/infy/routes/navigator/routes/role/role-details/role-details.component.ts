import { Component, OnInit } from '@angular/core'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { NavigatorService } from '../../../services/navigator.service'
import { ActivatedRoute } from '@angular/router'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { NsContentStripMultiple, WidgetContentService, NsContent } from '@ws-widget/collection'

import {
  ILpData,
  ILpCertification,
} from '../../../models/navigator.model'
@Component({
  selector: 'ws-app-role-details',
  templateUrl: './role-details.component.html',
  styleUrls: ['./role-details.component.scss'],
})
export class RoleDetailsComponent implements OnInit {

  roleId: string
  variantId: string
  lpData!: ILpData
  fetchStatus: TFetchStatus = 'none'
  hasAlternatives = false
  hasCertifications = false
  hasCourses = true
  showAlternatives = false

  strips: any[] = []
  certificationIds: string[] = []

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
          title: 'Courses',
          filters: [],
          request: {
            ids: [],
          },
        },
      ],
    },
  }

  certificationsResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
        {
          key: 'certifications-strip',
          preWidgets: [],
          title: 'Certifications',
          filters: [],
          request: {
            ids: [],
          },
        },
      ],
    },
  }

  alternateCertificationsResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
      ],
    },
  }

  constructor(public configSvc: ConfigurationsService,
              private navSvc: NavigatorService,
              private route: ActivatedRoute,
              private contentSvc: WidgetContentService,

  ) {
    this.variantId = this.route.snapshot.params.variant
    this.roleId = this.route.snapshot.queryParams.id
  }

  ngOnInit() {
    this.navSvc
      .fetchLearningPathIdData(String(this.roleId))
      .subscribe((lpResult: ILpData) => {
        this.lpData = lpResult
        this.fetchStatus = 'done'
        this.fetchContent(this.lpData.profiles[0].courses_list)
        this.getCertificationsForGM(this.lpData)
        this.getAlternativeCertificationsForGM(this.lpData)

      })
  }

  fetchContent(ids: string[]) {
    this.coursesResolverData.widgetData.strips.forEach(strip => {
      if (strip.key === 'courses-strip' && strip.request) {
        strip.request.ids = ids
        this.navSvc.fetchImageForContentIDs(strip.request.ids).subscribe(_ => {
        },                                                               _ => {
          this.hasCourses = false
        })
      }
    })
    this.coursesResolverData = { ...this.coursesResolverData }
  }

  getCertificationsForGM(data: ILpData) {
    let ids: string[] = []
    data.certification_data.forEach((certification: ILpCertification) => {
      ids.push(certification.primary_certificationId)
    })
    this.certificationsResolverData.widgetData.strips.forEach(strip => {
      if (strip.key === 'certifications-strip' && strip.request && strip.request.ids) {
        ids = [...strip.request.ids, ...ids]
        const setIds = new Set(ids)
        this.certificationIds = Array.from(setIds)
        strip.request.ids = Array.from(setIds)
      }
    })
    if (this.certificationsResolverData.widgetData.strips[0]) {
      // tslint:disable-next-line: max-line-length
      if (this.certificationsResolverData.widgetData.strips[0].request && this.certificationsResolverData.widgetData.strips[0].request.ids) {
        if (this.certificationsResolverData.widgetData.strips[0].request.ids.length > 0) {
          this.hasCertifications = true
        }
      }
    } else {
      this.hasCertifications = false
    }
    this.certificationsResolverData = { ...this.certificationsResolverData }

    this.navSvc.fetchImageForContentIDs(this.certificationIds).subscribe(_ => {
      // console.log('no error')
    },                                                                   _ => {
      // console.log('error occured')
      this.hasCertifications = false
    })
    // console.log('Has certifications', this.hasCertifications)
  }

  displayAlternatives() {
    this.showAlternatives = !this.showAlternatives
  }

  getAlternativeCertificationsForGM(data: ILpData) {
    data.certification_data.forEach((certification: ILpCertification) => {
      const certID = [certification.primary_certificationId]
      const alternateIds = certification.alternate_certificationId

      if (alternateIds.length > 0) {

        this.contentSvc.fetchMultipleContent(certID).subscribe((result: NsContent.IContent[]) => {
          const stripData = {
            key: `alternate-strip${certID}`,
            preWidgets: [],
            title: `Alternate Certification for ${result[0].name}`,
            filters: [],
            request: {
              ids: alternateIds,
            },
          }
          this.strips.push(stripData)

        },                                                     () => {

        },                                                     () => {
          this.alternateCertificationsResolverData.widgetData.strips = this.strips

          this.alternateCertificationsResolverData = { ...this.alternateCertificationsResolverData }
          if (this.alternateCertificationsResolverData.widgetData.strips.length > 0) {
            this.hasAlternatives = true
          } else {
            this.hasAlternatives = false
          }
        })
      } else {
      }
    })
  }
}

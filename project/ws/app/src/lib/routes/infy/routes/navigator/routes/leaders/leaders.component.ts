import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ILeadersData } from '../../models/navigator.model'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { NsContentStripMultiple } from '@ws-widget/collection'
@Component({
  selector: 'ws-app-leaders',
  templateUrl: './leaders.component.html',
  styleUrls: ['./leaders.component.scss'],
})
export class LeadersComponent implements OnInit {
  accelerateWidgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
        {
          key: 'accelerate-strip',
          preWidgets: [
            {
              widgetData: {
                  // tslint:disable-next-line: max-line-length
                html: `<img class="w-full h-full" src="/assets/images/marketing/Pentagon_Accelerate.svg"/>`,
                containerStyle: {
                  width: '265px',
                },
              },
              widgetSubType: 'elementHtml',
              widgetType: 'element',
              widgetHostClass: 'flex margin-right-l ws-mat-primary-text',
              widgetInstanceId: 'strip_featured',
            },
          ],
          title: 'Accelerate',
          filters: [],
          request: {
            ids: [],
          },
        },
      ],
      noDataWidget: {
        widgetData: {
          html:
              // tslint:disable-next-line: max-line-length
              '<div class="padding-s"> <div class="margin-bottom-s margin-top-m" i18n> <p class = "mat-h2 padding-left-m padding-right-m text-center margin-top-l font-weight">Contents will appear soon...</div>',
          containerStyle: {},
        },
        widgetSubType: 'elementHtml',
        widgetType: 'element',
      },
      errorWidget: {
        widgetType: 'errorResolver',
        widgetSubType: 'errorResolver',
        widgetData: {
          errorType: 'internalServer',
        },
      },
      loader: true,
    },
  }

  assureWidgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
        {
          key: 'assure-strip',
          preWidgets: [
            {
              widgetData: {
                  // tslint:disable-next-line: max-line-length
                html: `<img class="w-full h-full" src="/assets/images/marketing/Pentagon_Assure.svg"/>`,
                containerStyle: { width: '265px' },
              },
              widgetSubType: 'elementHtml',
              widgetType: 'element',
              widgetHostClass: 'flex margin-right-l',

              widgetInstanceId: 'strip_featured',
            },
          ],
          title: 'Assure',
          filters: [],
          request: {
            ids: ['lex_13387578105992038000'],
          },
        },
      ],
      noDataWidget: {
        widgetData: {
          html:
              // tslint:disable-next-line: max-line-length
              '<div class="padding-s"> <div class="margin-bottom-s margin-top-m" i18n> <p class = "mat-h2 padding-left-m padding-right-m text-center margin-top-l font-weight">Contents will appear soon...</div>',
          containerStyle: {},
        },
        widgetSubType: 'elementHtml',
        widgetType: 'element',
      },
      errorWidget: {
        widgetType: 'errorResolver',
        widgetSubType: 'errorResolver',
        widgetData: {
          errorType: 'internalServer',
        },
      },
      loader: true,
    },
  }

  experienceWidgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
        {
          key: 'experience-strip',
          preWidgets: [
            {
              widgetData: {
                  // tslint:disable-next-line: max-line-length
                html: `<img class="w-full h-full" src="/assets/images/marketing/Pentagon_Experience.svg"/>`,
                containerStyle: {
                  width: '265px',
                },
              },
              widgetSubType: 'elementHtml',
              widgetType: 'element',
              widgetHostClass: 'flex margin-right-l',

              widgetInstanceId: 'strip_featured',
            },
          ],
          title: 'Experience',
          filters: [],
          request: {
            ids: ['lex_13387578105992038000'],
          },
        },
      ],
      noDataWidget: {
        widgetData: {
          html:
              // tslint:disable-next-line: max-line-length
              '<div class="padding-s"> <div class="margin-bottom-s margin-top-m" i18n> <p class = "mat-h2 padding-left-m padding-right-m text-center margin-top-l font-weight">Contents will appear soon...</div>',
          containerStyle: {},
        },
        widgetSubType: 'elementHtml',
        widgetType: 'element',
      },
      errorWidget: {
        widgetType: 'errorResolver',
        widgetSubType: 'errorResolver',
        widgetData: {
          errorType: 'internalServer',
        },
      },
      loader: true,
    },
  }

  insightWidgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
        {
          key: 'insight-strip',
          preWidgets: [
            {
              widgetData: {
                  // tslint:disable-next-line: max-line-length
                html: `<img class="w-full h-full" src="/assets/images/marketing/Pentagon_Insight.svg"/>`,
                containerStyle: {
                  width: '265px',
                },
              },
              widgetSubType: 'elementHtml',
              widgetType: 'element',
              widgetHostClass: 'flex margin-right-l',

              widgetInstanceId: 'strip_featured',
            },
          ],
          title: 'Insight',
          filters: [],
          request: {
            ids: ['lex_13387578105992038000'],
          },
        },
      ],
      noDataWidget: {
        widgetData: {
          html:
              // tslint:disable-next-line: max-line-length
              '<div class="padding-s"> <div class="margin-bottom-s margin-top-m" i18n> <p class = "mat-h2 padding-left-m padding-right-m text-center margin-top-l font-weight">Contents will appear soon...</div>',
          containerStyle: {},
        },
        widgetSubType: 'elementHtml',
        widgetType: 'element',
      },
      errorWidget: {
        widgetType: 'errorResolver',
        widgetSubType: 'errorResolver',
        widgetData: {
          errorType: 'internalServer',
        },
      },
      loader: true,
    },
  }

  innovateWidgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
        {
          key: 'innovate-strip',
          preWidgets: [
            {
              widgetData: {
                  // tslint:disable-next-line: max-line-length
                html: `<img class="w-full h-full" src="/assets/images/marketing/Pentagon_Innovate.svg"/>`,
                containerStyle: {
                  width: '265px',
                },
              },
              widgetSubType: 'elementHtml',
              widgetType: 'element',
              widgetHostClass: 'flex margin-right-l',

              widgetInstanceId: 'strip_featured',
            },
          ],
          title: 'Innovate',
          filters: [],
          request: {
            ids: ['lex_13387578105992038000'],
          },
        },
      ],
      noDataWidget: {
        widgetData: {
          html:
              // tslint:disable-next-line: max-line-length
              '<div class="padding-s"> <div class="margin-bottom-s margin-top-m" i18n> <p class = "mat-h2 padding-left-m padding-right-m text-center margin-top-l font-weight">Contents will appear soon...</div>',
          containerStyle: {},
        },
        widgetSubType: 'elementHtml',
        widgetType: 'element',
      },
      errorWidget: {
        widgetType: 'errorResolver',
        widgetSubType: 'errorResolver',
        widgetData: {
          errorType: 'internalServer',
        },
      },
      loader: true,
    },
  }

  idsObtained = true
  selectedTrack = 'Accelerate'
  leadersData: ILeadersData[] = this.route.snapshot.data.pageData.data.dm_data
  leadersArray: ILeadersData[]
  availableCourses: string[]

  constructor(private route: ActivatedRoute) {
    this.leadersArray = []
    this.availableCourses = []
    // this.loggerSvc.log('Leaders Data', this.leadersData)
    this.initializeTrack('Accelerate')
  }

  ngOnInit() { }

  initializeTrack(trackName: string) {
    for (let i = 0; i < this.leadersData.length; i += 1) {
      if (this.leadersData[i].arm_name === 'Accelerate' && trackName === 'Accelerate') {
        const ids = this.leadersData[i].courses.map(course => {
          return course.course_link.split('/').reverse()[0]
        })
        this.accelerateWidgetResolverData.widgetData.strips.forEach(strip => {
          if (strip.key === 'accelerate-strip' && strip.request && strip.preWidgets) {
            strip.request.ids = ids
          }
        })
        this.accelerateWidgetResolverData = { ...this.accelerateWidgetResolverData }
      } else if (this.leadersData[i].arm_name === 'Assure' && trackName === 'Assure') {
        const ids = this.leadersData[i].courses.map(course => {
          return course.course_link.split('/').reverse()[0]
        })
        this.assureWidgetResolverData.widgetData.strips.forEach(strip => {
          if (strip.key === 'assure-strip' && strip.request && strip.preWidgets) {
            strip.request.ids = ids
          }
        })
        this.assureWidgetResolverData = { ...this.assureWidgetResolverData }
      } else if (this.leadersData[i].arm_name === 'Experience' && trackName === 'Experience') {
        const ids = this.leadersData[i].courses.map(course => {
          return course.course_link.split('/').reverse()[0]
        })
        this.experienceWidgetResolverData.widgetData.strips.forEach(strip => {
          if (strip.key === 'experience-strip' && strip.request && strip.preWidgets) {
            strip.request.ids = ids
          }
        })
        this.experienceWidgetResolverData = { ...this.experienceWidgetResolverData }
      } else if (this.leadersData[i].arm_name === 'Insight' && trackName === 'Insight') {
        const ids = this.leadersData[i].courses.map(course => {
          return course.course_link.split('/').reverse()[0]
        })
        this.insightWidgetResolverData.widgetData.strips.forEach(strip => {
          if (strip.key === 'insight-strip' && strip.request && strip.preWidgets) {
            strip.request.ids = ids
          }
        })
        this.insightWidgetResolverData = { ...this.insightWidgetResolverData }
      } else if (this.leadersData[i].arm_name === 'Innovate' && trackName === 'Innovate') {
        const ids = this.leadersData[i].courses.map(course => {
          return course.course_link.split('/').reverse()[0]
        })
        this.innovateWidgetResolverData.widgetData.strips.forEach(strip => {
          if (strip.key === 'innovate-strip' && strip.request && strip.preWidgets) {
            strip.request.ids = ids
          }
        })
        this.innovateWidgetResolverData = { ...this.innovateWidgetResolverData }
      }
    }

    this.idsObtained = true
  }

  trackClicked(newTrack: string) {
    this.selectedTrack = newTrack
    this.initializeTrack(newTrack)
  }
}

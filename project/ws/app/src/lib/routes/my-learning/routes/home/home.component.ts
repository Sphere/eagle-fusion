import { Component, OnDestroy, OnInit } from '@angular/core'
import { NsContentStripMultiple, ROOT_WIDGET_CONFIG, NsError } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, NsPage, TFetchStatus, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { NSProfileData } from '../../../profile/models/profile.model'
import { NSLearningData } from '../../models/my-learning.model'
import { MyLearningService } from '../../services/my-learning.service'
@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  learningData: any
  apiFetchStatus: TFetchStatus = 'none'
  prefChangeSubscription: Subscription | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  donutChartData: NSProfileData.IGraphWidget = {} as NSProfileData.IGraphWidget
  widgetResolverCertifiedData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > | null = null
  widgetResolverProfessionalData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > | null = null
  widgetResolverMasterData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > | null = null
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  isLtMedium$ = this.valueSvc.isLtMedium$
  screenSizeIsLtMedium = false
  constructor(
    private _MyLearningService: MyLearningService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
  ) { }

  ngOnInit() {
    this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.screenSizeIsLtMedium = isLtMedium
    })
    this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
      this.getGraphData()
    })
    this.fetchData()
  }

  onClick(event: string) {
    const certified = document.getElementById('certified')
    const professional = document.getElementById('professional')
    const master = document.getElementById('master')
    if (certified && event === 'certified') {
      certified.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
    if (professional && event === 'professional') {
      professional.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
    if (master && event === 'master') {
      master.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }
  fetchData() {
    this.apiFetchStatus = 'fetching'
    this._MyLearningService.getMyLearningData().subscribe(
      (result: NSLearningData.ILearningDetails) => {
        this.learningData = result
        if (this.learningData) {
          this.getLearningData()
          this.getGraphData()
          this.apiFetchStatus = 'done'
        }
      },
      () => {
        this.apiFetchStatus = 'error'
      },
    )
  }

  getLearningData() {
    const professionIds: string[] = []
    const certifiedIds: string[] = []
    const masterIds: string[] = []
    this.learningData.role_status.Professional.forEach((prof: any) => {
      professionIds.push(prof.content_id)
    })
    this.learningData.role_status.Certified.forEach((certified: any) => {
      certifiedIds.push(certified.content_id)
    })
    this.learningData.role_status.Master.forEach((master: any) => {
      masterIds.push(master.content_id)
    })
    this.widgetResolverCertifiedData = {
      widgetData: {
        strips: [
          {
            key: 'certified',
            title: '',

            stripConfig: {
              cardSubType: 'card-description-back',
              deletedMode: 'hide',
              intranetMode: 'greyOut',
            },
            request: {
              ids: certifiedIds,
            },
          },
        ],
        loader: true,
      },
      widgetType: ROOT_WIDGET_CONFIG.contentStrip._type,
      widgetSubType: ROOT_WIDGET_CONFIG.contentStrip.multiStrip,
      widgetHostClass: 'block sm:-mx-10 -mx-6',
    }
    this.widgetResolverProfessionalData = {
      widgetData: {
        strips: [
          {
            key: 'professional',
            title: '',

            stripConfig: {
              cardSubType: 'card-description-back',
              deletedMode: 'hide',
              intranetMode: 'greyOut',
            },
            request: {
              ids: professionIds,
            },
          },
        ],
        loader: true,
      },
      widgetType: ROOT_WIDGET_CONFIG.contentStrip._type,
      widgetSubType: ROOT_WIDGET_CONFIG.contentStrip.multiStrip,
      widgetHostClass: 'block sm:-mx-10 -mx-6',
    }
    this.widgetResolverMasterData = {
      widgetData: {
        strips: [
          {
            key: 'master',
            title: '',

            stripConfig: {
              cardSubType: 'card-description-back',
              deletedMode: 'hide',
              intranetMode: 'greyOut',
            },
            request: {
              ids: masterIds,
            },
          },
        ],
        loader: true,
      },
      widgetType: ROOT_WIDGET_CONFIG.contentStrip._type,
      widgetSubType: ROOT_WIDGET_CONFIG.contentStrip.multiStrip,
      widgetHostClass: 'block sm:-mx-10 -mx-6',
    }
  }
  getGraphData() {
    this.donutChartData = {
      widgetType: ROOT_WIDGET_CONFIG.graph._type,
      widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
      widgetData: {
        graphId: 'roleChart',
        graphType: 'doughnut',
        graphHeight: this.screenSizeIsLtMedium ? '80px' : '140px',
        graphWidth: this.screenSizeIsLtMedium ? '80px' : '140px',
        graphLegend: false,
        graphLegendPosition: 'top',
        graphLegendFontSize: 11,
        graphTicksFontSize: 11,
        graphGridLinesDisplay: false,
        graphDefaultPalette: 'palette1',
        graphData: {
          labels: ['Completed', 'Yet to complete'],
          datasets: [
            {
              label: '',
              data: [
                this.learningData.role_status.progress,
                100 - this.learningData.role_status.progress,
              ],
              backgroundColor: [this.configSvc.activeThemeObject
                ? this.configSvc.activeThemeObject.color.primary
                : '', '#bdc3c7'],
              borderWidth: 0,
            },
          ],
        },
      },
    }
  }

  ngOnDestroy() {
    if (this.prefChangeSubscription) {
      this.prefChangeSubscription.unsubscribe()
    }
  }
}

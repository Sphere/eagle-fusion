import { Component, OnInit, OnDestroy } from '@angular/core'
import { KnowledgeHubService } from '../../services/knowledge-hub.service'
import { Subscription } from 'rxjs'
import { ISearchObjForSearch, IKhubItemTile, IKhubDisplay } from '../../models/knowledgeHub.model'
import { Router, ActivatedRoute } from '@angular/router'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { NsError, ROOT_WIDGET_CONFIG } from '@ws-widget/collection'
@Component({
  selector: 'ws-app-infy-home',
  templateUrl: './khub-home.component.html',
  styleUrls: ['./khub-home.component.scss'],
})
export class KhubHomeComponent implements OnInit, OnDestroy {
  searchResultsSubscription: Subscription | undefined
  sObject: ISearchObjForSearch = {
    size: 25,
  } as ISearchObjForSearch
  resultObj: IKhubDisplay[] = []
  loader = true
  error = {
    load: false,
    message: '',
  }
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  constructor(
    private khubSrv: KnowledgeHubService,
    private route: Router,
    private activated: ActivatedRoute,
    private configSvc: ConfigurationsService,
  ) {}

  ngOnInit() {
    this.searchResultsSubscription = this.khubSrv.fetchPersonalization(this.sObject).subscribe(
      data => {
        for (const key in data) {
          if (key) {
            const resObj: IKhubDisplay = {} as IKhubDisplay
            if (key === 'project') {
              resObj.title = 'Project References'
              resObj.data = this.khubSrv.setTileProject(data.project)
            } else if (key === 'automationcentral') {
              resObj.title = 'Tools'
              resObj.data = this.khubSrv.setTilesDocs(data.automationcentral)
            } else if (key === 'kshop') {
              resObj.title = 'Documents'
              resObj.data = this.khubSrv.setTilesDocs(data.kshop)
            }
            this.resultObj.push(resObj)
          }
        }
        this.loader = false
      },
      error => {
        this.loader = false
        this.error.load = true
        this.error.message = error
      },
    )
  }
  ngOnDestroy() {
    if (this.searchResultsSubscription) {
      this.searchResultsSubscription.unsubscribe()
    }
  }

  goToView(data: IKhubItemTile) {
    try {
      this.route.navigate([`view/${data.category}/${data.itemId}/${data.source}`], {
        relativeTo: this.activated.parent,
      })
    } catch (e) {
      throw e
    }
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core'
import { NsTnc } from '../../../../../../../../../src/app/models/tnc.model'
import { Subscription } from 'rxjs'
import { NsWidgetResolver } from '../../../../../../../../../library/ws-widget/resolver/src/public-api'
import {
  NsError,
  ROOT_WIDGET_CONFIG,
} from '../../../../../../../../../library/ws-widget/collection/src/public-api'
import { ActivatedRoute, Router, Data } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import {
  LoggerService,
  ConfigurationsService,
  NsPage,
} from '../../../../../../../../../library/ws-widget/utils/src/public-api'
import { TncAppResolverService } from '../../../../../../../../../src/app/services/tnc-app-resolver.service'
import { TncPublicResolverService } from '../../../../../../../../../src/app/services/tnc-public-resolver.service'
import { Globals } from '../../globals'

@Component({
  selector: 'ws-app-tnc',
  templateUrl: './tnc.component.html',
  styleUrls: ['./tnc.component.scss'],
})
export class TncComponent implements OnInit, OnDestroy {
  tncData: NsTnc.ITnc | null = null
  routeSubscription: Subscription | null = null
  // errorFetchingTnc = false
  isAcceptInProgress = false
  errorInAccepting = false
  isPublic = false
  selectedLocale = ''
  checked = false
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  expectedUrl = ''
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private loggerSvc: LoggerService,
    private configSvc: ConfigurationsService,
    private tncProtectedSvc: TncAppResolverService,
    private tncPublicSvc: TncPublicResolverService,
    private globals: Globals,
  ) {}

  ngOnInit() {
    this.routeSubscription = this.activatedRoute.data.subscribe((response: Data) => {
      if (response.tnc.data) {
        this.tncData = response.tnc.data
        this.configSvc.isNewUser = Boolean(this.tncData && this.tncData.isNewUser)
        this.isPublic = response.isPublic || false
      } else {
        this.router.navigate(['error-service-unavailable'])
        // this.errorFetchingTnc = true
      }
    })
    const paramsMap = this.activatedRoute.snapshot.queryParamMap
    if (paramsMap.has('ref')) {
      this.configSvc.userUrl = paramsMap.get('ref') || ''
    }
    if (this.configSvc.userUrl) {
      this.expectedUrl = this.configSvc.userUrl
    }
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }

  getTnc(locale: string) {
    if (this.tncData) {
      if (this.isPublic) {
        this.tncPublicSvc.getPublicTnc(locale).subscribe(data => {
          this.assignTncData(data)
        })
      } else {
        this.tncProtectedSvc.getTnc(locale).subscribe(data => {
          this.assignTncData(data)
        })
      }
    }
  }

  private assignTncData(data: NsTnc.ITnc) {
    if (this.tncData) {
      this.tncData = {
        ...data,
      }
    }
  }

  getDp(locale: string) {
    let tncData: NsTnc.ITncUnit
    if (this.tncData) {
      tncData = this.tncData.termsAndConditions.filter(term => term.name === 'Generic T&C')[0]
      const dpTerm = this.tncData.termsAndConditions.filter(term => term.name === 'Data Privacy')[0]
      if (locale === dpTerm.language) {
        return
      }
      if (this.isPublic) {
        this.tncPublicSvc.getPublicTnc(locale).subscribe(data => {
          this.assignDp(tncData, data)
        })
      } else {
        this.tncProtectedSvc.getTnc(locale).subscribe(data => {
          this.assignDp(tncData, data)
        })
      }
    }
  }
  assignDp(tncData: NsTnc.ITncUnit, data: NsTnc.ITnc) {
    data.termsAndConditions[0] = tncData
    if (this.tncData) {
      this.tncData = {
        ...data,
      }
    }
  }

  acceptTnc() {
    if (this.tncData) {
      const generalTnc = this.tncData.termsAndConditions.filter(
        tncUnit => tncUnit.name === 'Generic T&C',
      )[0]
      const dataPrivacy = this.tncData.termsAndConditions.filter(
        tncUnit => tncUnit.name === 'Data Privacy',
      )[0]
      const termsAccepted: NsTnc.ITermAccepted[] = []
      if (generalTnc) {
        termsAccepted.push({
          acceptedLanguage: generalTnc.language,
          docName: generalTnc.name,
          version: generalTnc.version,
        })
      }
      if (dataPrivacy) {
        termsAccepted.push({
          acceptedLanguage: dataPrivacy.language,
          docName: dataPrivacy.name,
          version: dataPrivacy.version,
        })
      }
      this.isAcceptInProgress = true
      this.http.post('/apis/protected/v8/user/tnc/accept', { termsAccepted }).subscribe(
        () => {
          // TO DO: Telemetry event for success
          if (this.tncData) {
            this.tncData.isAccepted = true
          }
          this.configSvc.hasAcceptedTnc = true
          this.postProcess()
          if (
            this.tncData &&
            Boolean(this.tncData.isNewUser) &&
            this.configSvc.appSetup &&
            !this.globals.firstTimeSetupDone
          ) {
          } else {
            this.router.navigate(['page', 'home'])
          }
        },
        (err: any) => {
          this.loggerSvc.error('ERROR ACCEPTING TNC:', err)
          // TO DO: Telemetry event for failure
          this.errorInAccepting = true
          this.isAcceptInProgress = false
        },
      )
    } else {
      this.errorInAccepting = false
    }
  }
  postProcess() {
    this.http.patch('/apis/protected/v8/user/tnc/postprocessing', {}).subscribe()
  }
}

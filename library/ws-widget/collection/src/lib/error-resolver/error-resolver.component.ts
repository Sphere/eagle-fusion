import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '../../../../resolver/src/public-api'
import { NsError } from './error-resolver.model'
import { ConfigurationsService } from '../../../../utils/src/public-api'
import { ErrorResolverService } from './error-resolver.service'
import { ActivatedRoute } from '@angular/router'
@Component({
  selector: 'ws-widget-error-resolver',
  templateUrl: './error-resolver.component.html',
  styleUrls: ['./error-resolver.component.scss'],
})
export class ErrorResolverComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<NsError.IWidgetErrorResolver> {
  @Input() widgetData!: NsError.IWidgetErrorResolver

  errorType: Record<NsError.TErrorType, NsError.TErrorType> = {
    accessForbidden: 'accessForbidden',
    contentUnavailable: 'contentUnavailable',
    featureDisabled: 'featureDisabled',
    featureUnavailable: 'featureUnavailable',
    internalServer: 'internalServer',
    notFound: 'notFound',
    serviceUnavailable: 'serviceUnavailable',
    somethingsWrong: 'somethingsWrong',
  }
  constructor(
    private configService: ConfigurationsService,
    private errorResolverSvc: ErrorResolverService,
    private activateRoute: ActivatedRoute,
  ) {
    super()
  }

  async ngOnInit() {
    if (!this.widgetData) {
      this.widgetData = {
        errorType: this.activateRoute.snapshot.data.errorType,
      }
      this.initialize()
    } else {
      this.initialize()
    }
  }

  private async initialize() {
    if (this.widgetData && !this.widgetData.errorData && this.configService.instanceConfig) {
      const config: NsError.IErrorConfig = await this.errorResolverSvc.getErrorConfig(
        this.widgetData.errorDataPath ||
        this.configService.instanceConfig.defaultFeatureConfigs.error,
      )
      this.widgetData.errorData = this.getErrorData(config)
    }
  }

  private getErrorData(data: NsError.IErrorConfig): NsError.TAllErrorConfig {
    switch (this.widgetData.errorType) {
      case 'accessForbidden':
        return data.accessForbidden
      case 'contentUnavailable':
        return data.contentUnavailable
      case 'featureDisabled':
        return data.featureDisabled
      case 'featureUnavailable':
        return data.featureUnavailable
      case 'internalServer':
        return data.internalServer
      case 'notFound':
        return data.notFound
      case 'serviceUnavailable':
        return data.serviceUnavailable
      case 'somethingsWrong':
        return data.somethingsWrong
    }
  }
}

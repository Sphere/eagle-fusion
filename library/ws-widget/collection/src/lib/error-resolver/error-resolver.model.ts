import { IWidgetErrorAccessForbidden } from './components/error-access-forbidden/error-access-forbidden.model'
import { IWidgetErrorContentUnavailable } from './components/error-content-unavailable/error-content-unavailable.model'
import { IWidgetErrorFeatureDisabled } from './components/error-feature-disabled/error-feature-disabled.model'
import { IWidgetErrorFeatureUnavailable } from './components/error-feature-unavailable/error-feature-unavailable.model'
import { IWidgetErrorInternalServer } from './components/error-internal-server/error-internal-server.model'
import { IWidgetErrorNotFound } from './components/error-not-found/error-not-found.model'
import { IWidgetErrorServiceUnavailable } from './components/error-service-unavailable/error-service-unavailable.model'
import { IWidgetErrorSomethingsWrong } from './components/error-something-wrong/error-something-wrong.model'

export namespace NsError {
  export type TErrorType =
    | 'accessForbidden'
    | 'contentUnavailable'
    | 'featureDisabled'
    | 'featureUnavailable'
    | 'internalServer'
    | 'notFound'
    | 'serviceUnavailable'
    | 'somethingsWrong'

  export interface IErrorConfig {
    accessForbidden: IWidgetErrorAccessForbidden
    contentUnavailable: IWidgetErrorContentUnavailable
    featureDisabled: IWidgetErrorFeatureDisabled
    featureUnavailable: IWidgetErrorFeatureUnavailable
    internalServer: IWidgetErrorInternalServer
    notFound: IWidgetErrorNotFound
    serviceUnavailable: IWidgetErrorServiceUnavailable
    somethingsWrong: IWidgetErrorSomethingsWrong
  }

  export type TAllErrorConfig =
    | IWidgetErrorAccessForbidden
    | IWidgetErrorContentUnavailable
    | IWidgetErrorFeatureDisabled
    | IWidgetErrorFeatureUnavailable
    | IWidgetErrorInternalServer
    | IWidgetErrorNotFound
    | IWidgetErrorServiceUnavailable
    | IWidgetErrorSomethingsWrong

  export interface IWidgetErrorResolver {
    errorType: TErrorType
    errorData?: TAllErrorConfig
    errorDataPath?: string
  }
}

import { ErrorHandler, Injectable } from '@angular/core'
import { LoggerService } from '../../../../../../library/ws-widget/utils/src/public-api'
import { LoaderService } from './loader.service'

@Injectable()
export class AuthoringErrorHandler implements ErrorHandler {

  constructor(
    private loaderService: LoaderService,
    private loggerService: LoggerService,
  ) { }

  handleError(error: any) {
    this.loaderService.changeLoad.next(false)
    this.loggerService.error(error)
  }
}

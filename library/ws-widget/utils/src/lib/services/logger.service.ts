// tslint:disable:no-console
import { Injectable } from '@angular/core'
import { ConfigurationsService } from './configurations.service'

type consoleFun = (...args: any) => void
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  constructor(private readonly configSvc: ConfigurationsService) { }

  private readonly consoleError = console.error
  private readonly consoleInfo = console.info
  private readonly consoleLog = console.log
  private readonly consoleWarn = console.warn
  private readonly noConsole: consoleFun = () => { }

  get error() {
    return this.consoleError
  }
  get info() {
    return this.configSvc.isProduction ? this.noConsole : this.consoleInfo
  }
  get log() {
    return this.configSvc.isProduction ? this.noConsole : this.consoleLog
  }
  get warn() {
    return this.configSvc.isProduction ? this.noConsole : this.consoleWarn
  }

  removeConsoleAccess() {
    if (this.configSvc.isProduction) {
      return
    }
    const noConsoleWithError: consoleFun = () => {
      throw new Error('Console Functions Usage Are Not Allowed.')
    }
    // console.log = noConsoleWithError
    console.warn = noConsoleWithError
    console.info = noConsoleWithError
    console.error = noConsoleWithError
  }
}

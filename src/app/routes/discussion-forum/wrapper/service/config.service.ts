import { Injectable } from '@angular/core'
import { AbstractConfigService } from '@aastrika_npmjs/discussions-ui-v8'

@Injectable({
  providedIn: 'root',
})
export class ConfigService extends AbstractConfigService {

  constructor() {
    super()
  }

  getConfig(key: any) {
    // implementation for getting the configuration

    return localStorage.getItem(key)
  }

}

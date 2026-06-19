jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class { getCouseByContentSearch = jest.fn(); changeWork = jest.fn() },
  WidgetUserService: class {},
}))
jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {},
  ValueService: class {},
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
}))
jest.mock('src/app/services/user-data-cache.service', () => ({ UserDataCacheService: class {} }))
jest.mock('../../../services/language.service', () => ({ LanguageService: class {} }))
jest.mock('src/app/services/user-agent.service', () => ({ UserAgentResolverService: class {} }))

import { ChangeDetectorRef } from '@angular/core'
import { Subject } from 'rxjs'
import { WorkInfoListComponent } from './work-info-list.component'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '@ws-widget/collection'
import { HttpClient } from '@angular/common/http'
import { LanguageService } from '../../../services/language.service'

describe('WorkInfoListComponent', () => {
  let component: WorkInfoListComponent

  const mockValueService = { isXSmall$: new Subject<boolean>() }
  const mockConfigService = {} as ConfigurationsService
  const mockUserProfileService = {} as UserProfileService
  const mockWidgetContentService = {} as WidgetContentService
  const mockUserAgentResolverService = {} as any
  const mockSnackBar = { open: jest.fn() } as any as MatSnackBar
  const mockHttpClient = {} as HttpClient
  const mockLanguageService = {} as any as LanguageService
  const mockLoggerService = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any
  const mockTranslateService = { instant: jest.fn(), get: jest.fn() } as any
  const mockChangeDetectorRef = { detectChanges: jest.fn() } as any as ChangeDetectorRef

  beforeAll(() => {
    component = new WorkInfoListComponent(
      mockConfigService,
      mockUserProfileService,
      mockValueService as any as ValueService,
      mockWidgetContentService,
      mockUserAgentResolverService,
      mockSnackBar,
      mockHttpClient,
      mockLanguageService,
      mockLoggerService,
      mockTranslateService,
      mockChangeDetectorRef
    )
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })
})

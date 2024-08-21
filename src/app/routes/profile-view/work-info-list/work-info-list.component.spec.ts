import { TestBed } from '@angular/core/testing'
import { WorkInfoListComponent } from './work-info-list.component'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatOptionModule } from '@angular/material/core'
import { MatInputModule } from '@angular/material/input'
import { MobileProfileNavComponent } from '../mobile-profile-nav/mobile-profile-nav.component'
import { MatIconModule } from '@angular/material/icon'


import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { UserAgentResolverService } from '../../../services/user-agent.service'
import { HttpClient } from '@angular/common/http'
// import { of } from 'rxjs'

const mockProfileService: Partial<UserProfileService> = {}
const mockConfigService: Partial<ConfigurationsService> = {}
const mockValueService: Partial<ValueService> = {}
const mockWidgetService: Partial<WidgetContentService> = {}
const mockUserAgentService: Partial<UserAgentResolverService> = {}
const mockHttpService: Partial<HttpClient> = {}
const mockSnackBar: Partial<MatSnackBar> = {
  open: jest.fn()
}

describe('WorkInfoListComponent', () => {
  let component: WorkInfoListComponent
  beforeAll(() => {
    component = new WorkInfoListComponent(
      mockConfigService as ConfigurationsService,
      mockProfileService as UserProfileService,
      mockValueService as ValueService,
      mockWidgetService as WidgetContentService,
      mockUserAgentService as UserAgentResolverService,
      mockSnackBar as MatSnackBar,
      mockHttpService as HttpClient,

    )
  })
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkInfoListComponent, MobileProfileNavComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatInputModule,
        MatIconModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ConfigurationsService, useValue: mockConfigService },
        { provide: UserProfileService, useValue: mockProfileService },
        { provide: ValueService, useValue: mockValueService },
        { provide: WidgetContentService, useValue: mockWidgetService },
        { provide: UserAgentResolverService, useValue: mockUserAgentService },
        { provide: HttpClient, useValue: mockHttpService },
        { provide: MatSnackBar, useValue: jest.fn() }
      ]
    }).compileComponents()
  })


  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

})

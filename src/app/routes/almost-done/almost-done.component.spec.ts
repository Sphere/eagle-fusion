import { ComponentFixture, TestBed } from '@angular/core/testing'
import { AlmostDoneComponent } from './almost-done.component'
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { MatInputModule } from '@angular/material/input'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterTestingModule } from '@angular/router/testing'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { HttpClient } from '@angular/common/http'
import { UserAgentResolverService } from '../../services/user-agent.service'

const mockConfigService: Partial<ConfigurationsService> = {}
const mockUserProfileService: Partial<UserProfileService> = {}
const mockRouterService: Partial<Router> = {}
const mockActivatedRouteService: Partial<ActivatedRoute> = {}
const mockHttpService: Partial<HttpClient> = {}
const mockUserAgentService: Partial<UserAgentResolverService> = {}
const mockSignupService: Partial<SignupService> = {}

const mockFormBuilder: Partial<UntypedFormBuilder> = {
  group: jest.fn()
}
const mockMatSnackBar: Partial<MatSnackBar> = {
  open: jest.fn()
}

describe('PublicLoginComponent', () => {
  let component: AlmostDoneComponent
  let fixture: ComponentFixture<AlmostDoneComponent>
  beforeAll(() => {
    component = new AlmostDoneComponent(
      mockConfigService as ConfigurationsService,
      mockUserProfileService as UserProfileService,
      // mockRouterService as Router,
      mockMatSnackBar as MatSnackBar,
      mockFormBuilder as UntypedFormBuilder,
      mockActivatedRouteService as ActivatedRoute,
      mockHttpService as HttpClient,
      mockUserAgentService as UserAgentResolverService,
      mockSignupService as SignupService,

    )
  })
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlmostDoneComponent],
      imports: [RouterModule, MatInputModule, MatSnackBarModule, BrowserAnimationsModule, ReactiveFormsModule, RouterTestingModule],
      providers: [
        UntypedFormBuilder,
        { provide: ConfigurationsService, useValue: mockConfigService },
        { provide: UserProfileService, useValue: mockUserProfileService },
        { provide: Router, useValue: mockRouterService },
        { provide: HttpClient, useValue: mockHttpService },
        { provide: ActivatedRoute, useValue: mockActivatedRouteService },
        { provide: UserAgentResolverService, useValue: mockUserAgentService },
        { provide: SignupService, useValue: mockSignupService },
        { provide: MatSnackBar, useValue: jest.fn() }
      ],
    })
      .compileComponents()
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(AlmostDoneComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })



  it('should create the component', () => {
    expect(component).toBeTruthy()
  })
  it('should initialize almostDoneForm and createUserForm', () => {
    expect(component.almostDoneForm).toBeDefined()
    expect(component.createUserForm).toBeDefined()
  })

  it('should set enableSubmit to false when selecting Mother/Family Members', () => {
    component.selectedBg = 'Mother/Family Members'
    component.chooseBackground('Mother/Family Members')
    expect(component.enableSubmit).toBeFalsy()
  })

  it('should set enableSubmit to true when selecting Asha Facilitator or Asha Trainer', () => {
    component.selectedBg = 'Asha Facilitator'
    component.chooseBackground('Asha Facilitator')
    expect(component.enableSubmit).toBeTruthy()

    component.selectedBg = 'Asha Trainer'
    component.chooseBackground('Asha Trainer')
    expect(component.enableSubmit).toBeTruthy()
  })

  it('should call redirectToParent.emit() on redirectToYourBackground()', () => {
    spyOn(component.redirectToParent, 'emit')
    component.redirectToYourBackground()
    expect(component.redirectToParent.emit).toHaveBeenCalledWith('true')
  })

  it('should update profile and navigate to home page on submit', () => {
    component.yourBackground = { value: { country: 'India', state: 'State', distict: 'District', dob: 'DOB', countryCode: 'CountryCode' } }
    component.backgroundSelect = 'Background'
    component.almostDoneForm.controls.professSelected.setValue('ASHA')
    component.almostDoneForm.controls.locationselect.setValue('Location')
    spyOn(component, 'updateProfile')

    component.onsubmit()

    expect(component.updateProfile).toHaveBeenCalled()
  })

  it('should update profession and enableSubmit on professionSelect()', () => {
    component.profession = 'Profession'
    component.createUserForm.controls.designation.setValue('Designation')
    component.almostDoneForm.controls.profession.setValue('Profession')
    spyOn(component.almostDoneForm.controls.professionOtherSpecify, 'clearValidators')

    component.professionSelect('New Profession')

    expect(component.createUserForm.controls.designation.value).toEqual('New Profession')
    expect(component.almostDoneForm.controls.profession.value).toEqual('New Profession')
    expect(component.almostDoneForm.controls.professionOtherSpecify.clearValidators).toHaveBeenCalled()
    expect(component.professionOthersField).toBeFalsy()
    expect(component.rnFieldDisabled).toBeTruthy()
  })

  it('should update orgType and enableSubmit on orgTypeSelect()', () => {
    component.almostDoneForm.controls.orgType.setValue('OrgType')
    spyOn(component.almostDoneForm.controls.orgOtherSpecify, 'clearValidators')

    component.orgTypeSelect('New OrgType')

    expect(component.almostDoneForm.controls.orgType.value).toEqual('New OrgType')
    expect(component.almostDoneForm.controls.orgOtherSpecify.clearValidators).toHaveBeenCalled()
    expect(component.orgOthersField).toBeFalsy()
  })


})
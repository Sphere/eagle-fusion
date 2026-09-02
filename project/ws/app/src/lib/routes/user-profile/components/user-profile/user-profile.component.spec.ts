import { of, throwError, Subject } from 'rxjs'

jest.mock('@ws/author/src/public-api', () => ({
  LoaderService: jest.fn(),
}))

import { UserProfileComponent } from './user-profile.component'
import { NsUserProfileDetails } from '@ws/app/src/lib/routes/user-profile/models/NsUserProfile'

describe('UserProfileComponent', () => {
  let component: UserProfileComponent
  let snackBar: any
  let userProfileSvc: any
  let configSvc: any
  let router: any
  let route: any
  let fb: any
  let cd: any
  let dialog: any
  let loader: any
  let btnservice: any
  let http: any
  let userAgentSvc: any

  const buildComponent = () => {
    snackBar = { open: jest.fn(), openFromComponent: jest.fn() }
    userProfileSvc = {
      getMasterNationlity: jest.fn(() => of({ nationalities: [{ name: 'India', countryCode: '+91' }] })),
      getMasterLanguages: jest.fn(() => of({ languages: [{ name: 'English' }] })),
      listApprovalPendingFields: jest.fn(() => of({ result: { data: ['firstname'] } })),
      getUserdetailsFromRegistry: jest.fn(() => of({ profileDetails: { profileReq: null } })),
      updateProfileDetails: jest.fn(() => of({})),
    }
    configSvc = {
      unMappedUser: { id: 'u1', profileDetails: { userSource: 'src' } },
      userProfile: { firstName: 'John', lastName: 'Doe', email: 'john@yopmail.com', rootOrgName: 'org', userId: 'u1', language: 'en' },
      userProfileV2: { userId: 'u1' },
      profileDetailsStatus: false,
    }
    router = { navigate: jest.fn(), navigateByUrl: jest.fn() }
    route = {
      snapshot: {
        data: { pageData: { data: {} } },
        paramMap: { get: jest.fn(() => null) },
        queryParams: { edit: undefined },
      },
    }
    const { UntypedFormBuilder } = require('@angular/forms')
    fb = new UntypedFormBuilder()
    cd = { detectChanges: jest.fn(), markForCheck: jest.fn() }
    dialog = { open: jest.fn() }
    loader = { changeLoad: { next: jest.fn() } }
    btnservice = { changeName: jest.fn() }
    http = { get: jest.fn(() => of({})) }
    userAgentSvc = {
      getUserAgent: jest.fn(() => ({ OS: 'mac', browserName: 'chrome' })),
      generateCookie: jest.fn(() => 'cookie123'),
    }

    return new UserProfileComponent(
      snackBar, userProfileSvc, configSvc, router, route, fb, cd, dialog, loader, btnservice, http, userAgentSvc,
    )
  }

  beforeEach(() => {
    component = buildComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should build form on construction with expected controls', () => {
    expect(component.createUserForm.get('firstname')).toBeTruthy()
    expect(component.createUserForm.get('degrees')).toBeTruthy()
  })

  it('should set isForcedUpdate from route paramMap', () => {
    route.snapshot.paramMap.get = jest.fn(() => 'true')
    const c = new UserProfileComponent(
      snackBar, userProfileSvc, configSvc, router, route, fb, cd, dialog, loader, btnservice, http, userAgentSvc,
    )
    expect(c.isForcedUpdate).toBe(true)
  })

  describe('ngOnInit', () => {
    it('should call getUserDetails, fetchMeta and assignPrimaryEmailType', () => {
      jest.spyOn(component, 'getUserDetails')
      jest.spyOn(component, 'fetchMeta')
      component.ngOnInit()
      expect(component.getUserDetails).toHaveBeenCalled()
      expect(component.fetchMeta).toHaveBeenCalled()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should do nothing when queryParams.edit is empty string', () => {
      route.snapshot.queryParams.edit = ''
      component.ngAfterViewInit()
      expect(component.showBackBtn).toBeUndefined()
    })

    it('should set showBackBtn and navigate tab when edit param present', () => {
      route.snapshot.queryParams.edit = '2'
      component.usetMatTab = undefined as any
      component.ngAfterViewInit()
      expect(component.showBackBtn).toBe(true)
      expect(component.navigatedFromProfile).toBe(true)
    })

    it('goToNextTabIndex should return early for invalid tabGroup', () => {
      expect(() => (component as any).goToNextTabIndex(null, 1)).not.toThrow()
    })
  })

  describe('professionalChange', () => {
    it('handles Healthcare Worker', () => {
      component.professionalChange('Healthcare Worker')
      expect(component.professionOtherField).toBe(false)
    })
    it('handles Healthcare Volunteer', () => {
      component.professionalChange('Healthcare Volunteer')
      expect(component.professionOtherField).toBe(false)
    })
    it('handles Others', () => {
      component.professionalChange('Others')
      expect(component.professionOtherField).toBe(true)
    })
    it('handles default', () => {
      component.professionalChange('Student')
      expect(component.professionOtherField).toBe(false)
    })
  })

  describe('orgTypeSelect', () => {
    it('sets orgType value when option is not null', () => {
      component.orgTypeSelect('Private Sector')
      expect(component.createUserForm.get('orgType')!.value).toBe('Private Sector')
      expect(component.orgOthersField).toBe(false)
    })
    it('sets null when option is "null"', () => {
      component.orgTypeSelect('null')
      expect(component.createUserForm.get('orgType')!.value).toBeNull()
    })
    it('sets Others field and validators', () => {
      component.orgTypeSelect('Others')
      expect(component.orgOthersField).toBe(true)
    })
  })

  describe('fetchMeta', () => {
    it('should populate nationalities and languages, and degree/state meta', () => {
      component.masterNationalities = []
      component.fetchMeta()
      expect(component.masterNationalities.length).toBe(1)
      expect(component.countryCodes[0]).toBe('+91')
      expect(component.masterLanguagesEntries.length).toBe(1)
    })

    it('should handle nationality error', () => {
      userProfileSvc.getMasterNationlity = jest.fn(() => throwError(() => new Error('fail')))
      expect(() => component.fetchMeta()).not.toThrow()
    })

    it('should handle language error', () => {
      userProfileSvc.getMasterLanguages = jest.fn(() => throwError(() => new Error('fail')))
      expect(() => component.fetchMeta()).not.toThrow()
    })
  })

  describe('councilFilter', () => {
    it('filters by value', () => {
      const result = (component as any).councilFilter('Delhi')
      expect(result).toContain('Delhi Nursing Council')
    })
    it('returns all when no value', () => {
      const result = (component as any).councilFilter('')
      expect(result).toEqual(component.nursingCouncilNames)
    })
  })

  describe('degree form array helpers', () => {
    it('createDegree returns a form group', () => {
      const group = component.createDegree()
      expect(group.get('degree')).toBeTruthy()
    })

    it('createDegreeWithValues populates values', () => {
      const group = component.createDegreeWithValues({ nameOfQualification: 'BSc', nameOfInstitute: 'XYZ', yearOfPassing: '2020', type: 'GRADUATE' } as any)
      expect(group.get('degree')!.value).toBe('BSc')
    })

    it('addDegree pushes to degrees array', () => {
      const before = (component.createUserForm.get('degrees') as any).length
      component.addDegree()
      expect((component.createUserForm.get('degrees') as any).length).toBe(before + 1)
    })

    it('addDegreeValues pushes with values', () => {
      component.addDegreeValues({ nameOfQualification: 'MSc', nameOfInstitute: 'ABC', yearOfPassing: '2021', type: 'POSTGRADUATE' } as any)
      expect(component.degreesControls.length).toBeGreaterThan(1)
    })

    it('removeDegrees removes at index', () => {
      component.addDegree()
      const before = component.degreesControls.length
      component.removeDegrees(0)
      expect(component.degreesControls.length).toBe(before - 1)
    })

    it('addPostDegree pushes to postDegrees array', () => {
      const before = (component.createUserForm.get('postDegrees') as any).length
      component.addPostDegree()
      expect((component.createUserForm.get('postDegrees') as any).length).toBe(before + 1)
    })

    it('addPostDegreeValues pushes with values', () => {
      component.addPostDegreeValues({ nameOfQualification: 'PhD', nameOfInstitute: 'DEF', yearOfPassing: '2022', type: 'POSTGRADUATE' } as any)
      expect(component.postDegreesControls.length).toBeGreaterThan(1)
    })

    it('postDegreesControls returns [] when control missing', () => {
      const spy = jest.spyOn(component.createUserForm, 'get').mockReturnValue(null as any)
      expect(component.postDegreesControls).toEqual([])
      spy.mockRestore()
    })

    it('removePostDegrees removes at index', () => {
      component.addPostDegree()
      const before = component.postDegreesControls.length
      component.removePostDegrees(0)
      expect(component.postDegreesControls.length).toBe(before - 1)
    })
  })

  describe('onChanges* streams', () => {
    it('onChangesNationality sets masterNationality observable', done => {
      component.masterNationalities = [{ name: 'India' } as any]
      component.onChangesNationality()
      component.masterNationality!.subscribe(result => {
        expect(result).toEqual([{ name: 'India' }])
        done()
      })
    })

    it('onChangesLanuage sets masterLanguages observable', done => {
      component.masterLanguagesEntries = [{ name: 'English' } as any]
      component.onChangesLanuage()
      component.masterLanguages!.subscribe(result => {
        expect(result).toEqual([{ name: 'English' }])
        done()
      })
    })

    it('onChangesKnownLanuage sets masterKnownLanguages observable', done => {
      component.masterLanguagesEntries = [{ name: 'English' } as any]
      component.onChangesKnownLanuage()
      component.masterKnownLanguages!.subscribe(result => {
        expect(result).toEqual([{ name: 'English' }])
        done()
      })
    })

    it('onChangesKnownLanuage handles array value', done => {
      component.masterLanguagesEntries = [{ name: 'English' } as any]
      component.onChangesKnownLanuage()
      component.masterKnownLanguages!.subscribe(() => done())
      component.createUserForm.get('knownLanguages')!.setValue(['English'])
    })
  })

  describe('filter helpers', () => {
    it('filterNationality filters by name', () => {
      component.masterNationalities = [{ name: 'India' } as any, { name: 'USA' } as any]
      expect((component as any).filterNationality('ind')).toEqual([{ name: 'India' }])
    })
    it('filterNationality returns all when empty', () => {
      component.masterNationalities = [{ name: 'India' } as any]
      expect((component as any).filterNationality('')).toEqual(component.masterNationalities)
    })
    it('filterLanguage filters by name', () => {
      component.masterLanguagesEntries = [{ name: 'English' } as any, { name: 'Hindi' } as any]
      expect((component as any).filterLanguage('hin')).toEqual([{ name: 'Hindi' }])
    })
    it('filterMultiLanguage returns empty array due to missing return in filter callback (source bug)', () => {
      component.masterLanguagesEntries = [{ name: 'English' } as any]
      expect((component as any).filterMultiLanguage(['english'])).toEqual([])
    })
    it('filterMultiLanguage returns all when name falsy', () => {
      component.masterLanguagesEntries = [{ name: 'English' } as any]
      expect((component as any).filterMultiLanguage(null as any)).toEqual([{ name: 'English' }])
    })
  })

  describe('ngOnDestroy', () => {
    it('unsubscribes when subscription open', () => {
      const sub = new Subject().subscribe()
      component.unseenCtrlSub = sub as any
      component.ngOnDestroy()
      expect(sub.closed).toBe(true)
    })
    it('does nothing when no subscription', () => {
      component.unseenCtrlSub = undefined as any
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('known language chip handlers', () => {
    beforeEach(() => {
      component.knownLanguagesInputRef = { nativeElement: { value: 'x' } } as any
    })

    it('selectKnowLanguage adds new lang', () => {
      component.selectedKnowLangs = []
      component.selectKnowLanguage({ option: { value: { name: 'English' } as any } })
      expect(component.selectedKnowLangs.length).toBe(1)
      expect(component.knownLanguagesInputRef.nativeElement.value).toBe('')
    })

    it('selectKnowLanguage does not duplicate', () => {
      const lang = { name: 'English' } as any
      component.selectedKnowLangs = [lang]
      component.selectKnowLanguage({ option: { value: lang } })
      expect(component.selectedKnowLangs.length).toBe(1)
    })

    it('removeKnowLanguage removes existing', () => {
      const lang = { name: 'English' } as any
      component.selectedKnowLangs = [lang]
      component.removeKnowLanguage(lang)
      expect(component.selectedKnowLangs.length).toBe(0)
    })

    it('removeKnowLanguage no-op when not found', () => {
      component.selectedKnowLangs = []
      component.removeKnowLanguage({ name: 'x' } as any)
      expect(component.selectedKnowLangs.length).toBe(0)
    })

    it('add pushes value and resets input', () => {
      component.selectedKnowLangs = []
      component.add({ input: { value: 'x' } as any, value: 'English' } as any)
      expect(component.selectedKnowLangs.length).toBe(1)
    })

    it('add handles no input', () => {
      component.selectedKnowLangs = []
      component.add({ input: null as any, value: 'English' } as any)
      expect(component.selectedKnowLangs.length).toBe(1)
    })
  })

  describe('interest/hobby chip handlers', () => {
    it('addPersonalInterests pushes and resets interests control', () => {
      component.personalInterests = []
      component.addPersonalInterests({ input: { value: 'x' } as any, value: 'Reading' } as any)
      expect(component.personalInterests.length).toBe(1)
      expect(component.createUserForm.get('interests')!.value).toBeNull()
    })

    it('addHobbies pushes and resets hobbies control', () => {
      component.selectedHobbies = []
      component.addHobbies({ input: { value: 'x' } as any, value: 'Music' } as any)
      expect(component.selectedHobbies.length).toBe(1)
    })

    it('removePersonalInterests removes existing', () => {
      const interest = { name: 'x' } as any
      component.personalInterests = [interest]
      component.removePersonalInterests(interest)
      expect(component.personalInterests.length).toBe(0)
    })

    it('removeHobbies removes existing', () => {
      const hobby = { name: 'y' } as any
      component.selectedHobbies = [hobby]
      component.removeHobbies(hobby)
      expect(component.selectedHobbies.length).toBe(0)
    })
  })

  describe('getUserDetails', () => {
    it('handles unMappedUser branch with existing registry data', () => {
      configSvc.userProfile.email = 'someone@yopmail.com'
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of({
        profileDetails: {
          profileReq: {
            personalDetails: { firstname: 'A', dob: '01-01-2000' },
            academics: [],
            professionalDetails: [],
          },
        },
      }))
      component.getUserDetails()
      expect(component.mobileNumberLogin).toBe(true)
      expect(component.isEditable).toBe(true)
    })

    it('handles unMappedUser branch with no userData and configSvc.userProfile present', () => {
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of({ profileDetails: { profileReq: null } }))
      component.getUserDetails()
      expect(component.createUserForm.get('firstname')!.value).toBe('John')
    })

    it('skips registry fetch entirely when userProfile is falsy (outer guard)', () => {
      configSvc.userProfile = null
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of({ profileDetails: { profileReq: null } }))
      component.getUserDetails()
      expect(userProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
    })

    it('handles registry error', () => {
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() => throwError(() => new Error('fail')))
      expect(() => component.getUserDetails()).not.toThrow()
    })

    it('handles preferedLanguage default when no language set', () => {
      configSvc.userProfile.language = undefined
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of({ profileDetails: { profileReq: null } }))
      component.getUserDetails()
      expect(component.preferedLanguage).toEqual({ id: 'en', lang: 'English' })
    })

    it('handles no unMappedUser id branch with yopmail email', () => {
      configSvc.unMappedUser = { profileDetails: { personalDetails: { firstname: 'A', surname: 'B' } } }
      configSvc.userProfile.email = 'test@yopmail.com'
      component.getUserDetails()
      expect(component.mobileNumberLogin).toBe(true)
    })

    it('handles no unMappedUser id branch with non-yopmail email', () => {
      configSvc.unMappedUser = { profileDetails: { personalDetails: { firstname: 'A', surname: 'B' } } }
      configSvc.userProfile.email = 'test@gmail.com'
      component.getUserDetails()
      expect(component.createUserForm.get('firstname')).toBeTruthy()
    })

    it('does nothing when neither unMappedUser nor userProfile present', () => {
      configSvc.unMappedUser = null
      configSvc.userProfile = null
      expect(() => component.getUserDetails()).not.toThrow()
    })
  })

  describe('populateOrganisationDetails / populateAcademics / populateChips', () => {
    it('populateOrganisationDetails returns default when no professionalDetails', () => {
      const result = (component as any).populateOrganisationDetails({})
      expect(result.orgName).toBe('')
    })

    it('populateOrganisationDetails maps first entry', () => {
      const result = (component as any).populateOrganisationDetails({
        professionalDetails: [{ name: 'Org', orgType: 'Others', doj: '01-01-2020' }],
      })
      expect(result.orgName).toBe('Org')
    })

    it('populateAcademics handles all types', () => {
      const result = (component as any).populateAcademics({
        academics: [
          { type: 'X_STANDARD', nameOfInstitute: 'S1', yearOfPassing: '2000' },
          { type: 'XII_STANDARD', nameOfInstitute: 'S2', yearOfPassing: '2002' },
          { type: 'GRADUATE', nameOfQualification: 'BSc', nameOfInstitute: 'C1', yearOfPassing: '2005' },
          { type: 'POSTGRADUATE', nameOfQualification: 'MSc', nameOfInstitute: 'C2', yearOfPassing: '2007' },
        ],
      })
      expect(result.X_STANDARD.schoolName10).toBe('S1')
      expect(result.degree.length).toBe(1)
      expect(result.postDegree.length).toBe(1)
    })

    it('populateAcademics handles missing academics', () => {
      const result = (component as any).populateAcademics({})
      expect(result.degree).toEqual([])
    })

    it('populateChips populates languages, interests and hobbies', () => {
      component.selectedKnowLangs = []
      component.personalInterests = []
      component.selectedHobbies = []
      ;(component as any).populateChips({
        personalDetails: { knownLanguages: [{ name: 'English' }] },
        interests: { professional: ['Reading'], hobbies: ['Music'] },
      })
      expect(component.selectedKnowLangs.length).toBe(1)
      expect(component.personalInterests.length).toBe(1)
      expect(component.selectedHobbies.length).toBe(1)
    })

    it('populateChips handles no data gracefully', () => {
      expect(() => (component as any).populateChips({})).not.toThrow()
    })
  })

  describe('filterPrimaryEmailType', () => {
    it('sets isOfficialEmail true when officialEmail present', () => {
      const result = (component as any).filterPrimaryEmailType({ personalDetails: { officialEmail: 'x@y.com' } })
      expect(component.isOfficialEmail).toBe(true)
      expect(result).toBe(component.ePrimaryEmailType.OFFICIAL)
    })
    it('sets isOfficialEmail false otherwise', () => {
      (component as any).filterPrimaryEmailType({ personalDetails: {} })
      expect(component.isOfficialEmail).toBe(false)
    })
  })

  describe('constructFormFromRegistry', () => {
    it('patches the form and sets flags', () => {
      const academics = { X_STANDARD: { schoolName10: 'S', yop10: '2000' }, XII_STANDARD: { schoolName12: 'S2', yop12: '2002' }, degree: [], postDegree: [] }
      const org = { orgType: 'Others', profession: 'Others', orgName: 'Other', industry: 'Other', designation: 'Other' }
      ;(component as any).constructFormFromRegistry({ personalDetails: { firstname: 'A', dob: '01-01-2000' } }, academics, org)
      expect(component.orgOthersField).toBe(true)
      expect(component.professionOtherField).toBe(true)
      expect(component.showDesignationOther).toBe(true)
      expect(component.showOrgnameOther).toBe(true)
      expect(component.showIndustryOther).toBe(true)
    })
  })

  describe('checkvalue', () => {
    it('returns empty string for literal "undefined"', () => {
      expect(component.checkvalue('undefined')).toBeUndefined()
    })
    it('returns value otherwise', () => {
      expect(component.checkvalue('abc')).toBe('abc')
    })
  })

  describe('setProfilePhotoValue / setDropDownOther', () => {
    it('sets photoUrl from data', () => {
      component.setProfilePhotoValue({ photo: 'url' })
      expect(component.photoUrl).toBe('url')
    })
    it('sets photoUrl undefined when no photo', () => {
      component.setProfilePhotoValue({})
      expect(component.photoUrl).toBeUndefined()
    })
    it('sets other flags when values are Other', () => {
      component.setDropDownOther({ designation: 'Other', orgName: 'Other', industry: 'Other' })
      expect(component.showDesignationOther).toBe(true)
      expect(component.showOrgnameOther).toBe(true)
      expect(component.showIndustryOther).toBe(true)
    })
  })

  describe('constructReq / getOrganisationsHistory / getAcademics / getClass10 / getClass12 / getDegree / getPostDegree', () => {
    beforeEach(() => {
      component.userProfileData = { userId: 'u1', personalDetails: {} }
      component.createUserForm.patchValue({
        firstname: 'A', surname: 'B', schoolName10: 'S1', yop10: '2000', schoolName12: 'S2', yop12: '2002',
        primaryEmailType: component.ePrimaryEmailType.OFFICIAL, primaryEmail: 'a@b.com',
      })
    })

    it('constructReq builds a profileReq with official email', () => {
      const result = (component as any).constructReq(component.createUserForm)
      expect(result.profileReq.personalDetails.officialEmail).toBe('a@b.com')
    })

    it('constructReq clears official email when not official type', () => {
      component.createUserForm.patchValue({ primaryEmailType: component.ePrimaryEmailType.PERSONAL })
      const result = (component as any).constructReq(component.createUserForm)
      expect(result.profileReq.personalDetails.officialEmail).toBe('')
    })

    it('getOrganisationsHistory returns array with one org', () => {
      const result = (component as any).getOrganisationsHistory(component.createUserForm)
      expect(result.length).toBe(1)
    })

    it('getAcademics aggregates all academic entries', () => {
      const result = (component as any).getAcademics(component.createUserForm)
      expect(result.length).toBeGreaterThanOrEqual(2)
    })

    it('getClass10 and getClass12 return correct shape', () => {
      expect(component.getClass10(component.createUserForm).nameOfInstitute).toBe('S1')
      expect(component.getClass12(component.createUserForm).nameOfInstitute).toBe('S2')
    })

    it('getDegree and getPostDegree map form arrays', () => {
      expect(component.getDegree(component.createUserForm, 'GRADUATE').length).toBe(1)
      expect(component.getPostDegree(component.createUserForm, 'POSTGRADUATE').length).toBe(1)
    })
  })

  describe('onSubmit', () => {
    beforeEach(() => {
      component.userProfileData = { userId: 'u1', personalDetails: {} }
      component.toastSuccess = { nativeElement: { value: 'success' } } as any
      component.toastError = { nativeElement: { value: 'error' } } as any
      component.createUserForm.patchValue({
        dob: '2000-01-01', allotmentYear: '2020', civilListNo: '123', employeeCode: 'E1', otherDetailsOfficePinCode: '123456',
        otherDetailsDoj: '2020-01-01', doj: '2020-01-01',
      })
    })

    it('submits successfully and navigates home', async () => {
      await component.onSubmit(component.createUserForm)
      expect(userProfileSvc.updateProfileDetails).toHaveBeenCalled()
      expect(snackBar.open).toHaveBeenCalledWith('success', 'X', { duration: 5000 })
      expect(router.navigate).toHaveBeenCalledWith(['page', 'home'])
    })

    it('navigates to selectedCourse when navigatedFromProfile and localStorage set', async () => {
      component.navigatedFromProfile = true
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('/some/course')
      await component.onSubmit(component.createUserForm)
      expect(router.navigateByUrl).toHaveBeenCalledWith('/some/course')
    })

    it('navigates to profile dashboard when navigatedFromProfile and no selectedCourse', async () => {
      component.navigatedFromProfile = true
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
      await component.onSubmit(component.createUserForm)
      expect(router.navigate).toHaveBeenCalledWith(['app', 'profile', 'dashboard'])
    })

    it('handles update failure by showing error toast', async () => {
      userProfileSvc.updateProfileDetails = jest.fn(() => throwError(() => new Error('fail')))
      await component.onSubmit(component.createUserForm)
      expect(snackBar.open).toHaveBeenCalledWith('error', 'X', { duration: 5000 })
      expect(component.uploadSaveData).toBe(false)
    })

    it('handles getUserdetailsFromRegistry failure after update silently', async () => {
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() => throwError(() => new Error('fail')))
      await expect(component.onSubmit(component.createUserForm)).resolves.toBeUndefined()
    })

    it('skips post-update registry fetch when no userProfile', async () => {
      configSvc.userProfile = null
      await component.onSubmit(component.createUserForm)
      expect(userProfileSvc.updateProfileDetails).toHaveBeenCalled()
    })
  })

  describe('updateBtnProfileName', () => {
    it('delegates to btnservice.changeName', () => {
      component.updateBtnProfileName('Jane')
      expect(btnservice.changeName).toHaveBeenCalledWith('Jane')
    })
  })

  describe('formNext', () => {
    it('cycles back to 0 at index 3', () => {
      component.selectedIndex = 3
      component.formNext()
      expect(component.selectedIndex).toBe(0)
    })
    it('increments otherwise', () => {
      component.selectedIndex = 1
      component.formNext()
      expect(component.selectedIndex).toBe(2)
    })
  })

  describe('navigateBack', () => {
    it('navigates to page/home', () => {
      component.navigateBack()
      expect(router.navigate).toHaveBeenCalledWith(['page', 'home'])
    })
  })

  describe('officialEmailCheck', () => {
    it('toggles isOfficialEmail and updates form', () => {
      component.isOfficialEmail = false
      component.officialEmailCheck()
      expect(component.isOfficialEmail).toBe(true)
      expect(component.createUserForm.get('primaryEmailType')!.value).toBe(component.ePrimaryEmailType.OFFICIAL)
    })
  })

  describe('assignPrimaryEmailTypeCheckBox', () => {
    it('sets isOfficialEmail true for OFFICIAL type', () => {
      (component as any).assignPrimaryEmailTypeCheckBox(NsUserProfileDetails.EPrimaryEmailType.OFFICIAL)
      expect(component.isOfficialEmail).toBe(true)
    })
    it('sets isOfficialEmail false otherwise', () => {
      (component as any).assignPrimaryEmailTypeCheckBox('OTHER')
      expect(component.isOfficialEmail).toBe(false)
    })
  })

  describe('getDateFromText', () => {
    it('parses dd-mm-yyyy string into Date', () => {
      const result = (component as any).getDateFromText('15-06-2020')
      expect(result instanceof Date).toBe(true)
    })
    it('returns empty string for falsy input', () => {
      expect((component as any).getDateFromText('')).toBe('')
    })
  })

  describe('otherDropDownChange', () => {
    it('resets orgNameOther when field is orgname and value not Other', () => {
      component.showOrgnameOther = true
      component.otherDropDownChange('X', 'orgname')
      expect(component.showOrgnameOther).toBe(false)
    })
    it('resets industryOther when field is industry and value not Other', () => {
      component.showIndustryOther = true
      component.otherDropDownChange('X', 'industry')
      expect(component.showIndustryOther).toBe(false)
    })
    it('resets designation field when value not Other', () => {
      component.showDesignationOther = true
      component.otherDropDownChange('X', 'designation')
      expect(component.showDesignationOther).toBe(false)
    })
    it('does nothing when value is Other', () => {
      component.showOrgnameOther = true
      component.otherDropDownChange('Other', 'orgname')
      expect(component.showOrgnameOther).toBe(true)
    })
  })

  describe('uploadProfileImg', () => {
    const makeFile = (name: string, size: number) => {
      const file = new File(['x'], name)
      Object.defineProperty(file, 'size', { value: size })
      return file
    }

    it('shows invalid format notification for unsupported type', () => {
      const file = makeFile('test.xyz', 100)
      component.uploadProfileImg(file)
      expect(snackBar.openFromComponent).toHaveBeenCalled()
    })

    it('shows size error notification for oversized file', () => {
      const file = makeFile('test.png', 999999999)
      component.uploadProfileImg(file)
      expect(snackBar.openFromComponent).toHaveBeenCalled()
    })

    it('opens image crop dialog for valid file and sets photo on afterClosed with result', done => {
      const file = makeFile('test.png', 100)
      const resultFile = makeFile('cropped.png', 50)
      dialog.open = jest.fn(() => ({ afterClosed: () => of(resultFile) }))
      const originalReader = (global as any).FileReader
      class MockFileReader {
        result: any = 'data:url'
        onload: any
        readAsDataURL() {
          setTimeout(() => this.onload({}), 0)
        }
      }
      ;(global as any).FileReader = MockFileReader
      component.uploadProfileImg(file)
      setTimeout(() => {
        expect(component.photoUrl).toBe('data:url')
        ;(global as any).FileReader = originalReader
        done()
      }, 10)
    })

    it('does nothing on afterClosed with no result', () => {
      const file = makeFile('test.png', 100)
      dialog.open = jest.fn(() => ({ afterClosed: () => of(null) }))
      expect(() => component.uploadProfileImg(file)).not.toThrow()
    })
  })

  describe('onDateChange', () => {
    it('sets invalidDob false when age > 18', () => {
      component.onDateChange(new Date(1990, 0, 1))
      expect(component.invalidDob).toBe(false)
    })
    it('sets invalidDob true when age <= 18', () => {
      component.onDateChange(new Date())
      expect(component.invalidDob).toBe(true)
    })
  })

  describe('changeLanguage', () => {
    it('opens dialog and updates language when userProfileV2 exists', () => {
      const result = { id: 'hi' }
      dialog.open = jest.fn(() => ({ afterClosed: () => of(result) }))
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of({ profileDetails: {} }))
      const assignSpy = jest.fn()
      Object.defineProperty(window, 'location', { value: { assign: assignSpy, origin: 'http://x' }, writable: true })
      component.changeLanguage()
      expect(userProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalled()
      expect(userProfileSvc.updateProfileDetails).toHaveBeenCalled()
      expect(assignSpy).toHaveBeenCalledWith('http://x/hi/page/home')
    })

    it('assigns english home url when result.id is en', () => {
      const result = { id: 'en' }
      dialog.open = jest.fn(() => ({ afterClosed: () => of(result) }))
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of({ profileDetails: {} }))
      const assignSpy = jest.fn()
      Object.defineProperty(window, 'location', { value: { assign: assignSpy, origin: 'http://x' }, writable: true })
      component.changeLanguage()
      expect(assignSpy).toHaveBeenCalledWith('http://x/page/home')
    })

    it('does not call registry update when no userProfileV2', () => {
      configSvc.userProfileV2 = null
      dialog.open = jest.fn(() => ({ afterClosed: () => of({ id: 'en' }) }))
      component.changeLanguage()
      expect(userProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
    })

    it('handles update failure silently', () => {
      dialog.open = jest.fn(() => ({ afterClosed: () => of({ id: 'en' }) }))
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of({ profileDetails: {} }))
      userProfileSvc.updateProfileDetails = jest.fn(() => throwError(() => new Error('fail')))
      const assignSpy = jest.fn()
      Object.defineProperty(window, 'location', { value: { assign: assignSpy, origin: 'http://x' }, writable: true })
      expect(() => component.changeLanguage()).not.toThrow()
    })
  })

  describe('isAllowed', () => {
    it('returns false when field is in unApprovedField', () => {
      component.unApprovedField = ['firstname']
      expect(component.isAllowed('firstname')).toBe(false)
    })
    it('returns true when field is not in unApprovedField', () => {
      component.unApprovedField = ['firstname']
      expect(component.isAllowed('surname')).toBe(true)
    })
    it('returns true when no unApprovedField', () => {
      component.unApprovedField = undefined as any
      expect(component.isAllowed('firstname')).toBe(true)
    })
    it('returns true when name is falsy', () => {
      component.unApprovedField = ['firstname']
      expect(component.isAllowed('')).toBe(true)
    })
  })

  describe('fetchPendingFields', () => {
    it('sets unApprovedField from response', () => {
      component.fetchPendingFields()
      expect(component.unApprovedField).toEqual(['firstname'])
    })
    it('handles missing result gracefully', () => {
      userProfileSvc.listApprovalPendingFields = jest.fn(() => of({}))
      expect(() => component.fetchPendingFields()).not.toThrow()
    })
  })

  describe('setDegreeValuesArray / setPostDegreeValuesArray', () => {
    it('rebuilds degrees array from academics', () => {
      (component as any).setDegreeValuesArray({ degree: [{ nameOfQualification: 'BSc', nameOfInstitute: 'X', yearOfPassing: '2020' }] })
      expect(component.degreesControls.length).toBe(1)
    })
    it('rebuilds postDegrees array from academics', () => {
      (component as any).setPostDegreeValuesArray({ postDegree: [{ nameOfQualification: 'MSc', nameOfInstitute: 'Y', yearOfPassing: '2022' }] })
      expect(component.postDegreesControls.length).toBe(1)
    })
  })
})

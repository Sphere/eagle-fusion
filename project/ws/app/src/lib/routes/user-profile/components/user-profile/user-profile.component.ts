import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core'
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms'
import { ENTER, COMMA } from '@angular/cdk/keycodes'
import { Subscription, Observable } from 'rxjs'
import { startWith, map, debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { MatSnackBar, MatChipInputEvent, DateAdapter, MAT_DATE_FORMATS, MatDialog, MatTabGroup } from '@angular/material'
import { AppDateAdapter, APP_DATE_FORMATS, changeformat } from '../../services/format-datepicker'
import { ImageCropComponent } from '@ws-widget/utils/src/public-api'
import { IMAGE_MAX_SIZE, IMAGE_SUPPORT_TYPES } from '@ws/author/src/lib/constants/upload'
import { UserProfileService } from '../../services/user-profile.service'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'
import { Router, ActivatedRoute } from '@angular/router'
import {
  INationality,
  ILanguages,
  IChipItems,
  IGovtOrgMeta,
  IIndustriesMeta,
  IProfileAcademics,
  INation,
  IdegreesMeta,
  IdesignationsMeta,
  IUserProfileFields2,
} from '../../models/user-profile.model'
import { NsUserProfileDetails } from '@ws/app/src/lib/routes/user-profile/models/NsUserProfile'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { LoaderService } from '@ws/author/src/public-api'
import { BtnProfileService } from '@ws-widget/collection/src/lib/btn-profile/btn-profile.service'

@Component({
  selector: 'ws-app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
})
export class UserProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  createUserForm: FormGroup
  unseenCtrl!: FormControl
  unseenCtrlSub!: Subscription
  uploadSaveData = false
  selectedIndex = 0
  masterNationality: Observable<INation[]> | undefined
  states: any
  masterLanguages: Observable<ILanguages[]> | undefined
  masterKnownLanguages: Observable<ILanguages[]> | undefined
  masterNationalities: INation[] = []
  masterLanguagesEntries!: ILanguages[]
  selectedKnowLangs: ILanguages[] = []
  separatorKeysCodes: number[] = [ENTER, COMMA]
  public personalInterests: IChipItems[] = []
  public selectedHobbies: IChipItems[] = []
  ePrimaryEmailType = NsUserProfileDetails.EPrimaryEmailType
  eUserGender = NsUserProfileDetails.EUserGender
  eMaritalStatus = NsUserProfileDetails.EMaritalStatus
  eCategory = NsUserProfileDetails.ECategory
  userProfileFields!: NsUserProfileDetails.IUserProfileFields
  imageTypes = IMAGE_SUPPORT_TYPES
  today = new Date()
  phoneNumberPattern = '^((\\+91-?)|0)?[0-9]{10}$'
  pincodePattern = '(^[0-9]{6}$)'
  yearPattern = '(^[0-9]{4}$)'
  namePatern = `^[a-zA-Z\\s\\']{1,32}$`
  telephonePattern = `^[0-9]+-?[0-9]+$`
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>
  @ViewChild('knownLanguagesInput', { static: true }) knownLanguagesInputRef!: ElementRef<HTMLInputElement>
  isEditEnabled = false
  isEditable = false
  tncAccepted = false
  isOfficialEmail = false
  govtOrgMeta!: IGovtOrgMeta
  industriesMeta!: IIndustriesMeta
  degreesMeta!: IdegreesMeta
  designationsMeta!: IdesignationsMeta
  public degrees!: FormArray
  public postDegrees!: FormArray
  public degreeInstitutes = []
  public postDegreeInstitutes = []
  public countryCodes: string[] = []
  showDesignationOther!: boolean
  showOrgnameOther!: boolean
  showIndustryOther!: boolean
  photoUrl!: string | ArrayBuffer | null
  isForcedUpdate = false
  userProfileData!: any
  showBackBtn!: boolean
  @ViewChild('usetMatTab', { static: false }) usetMatTab!: MatTabGroup
  navigatedFromProfile = false
  mobileNumberLogin = false
  mobileLoginNumber = ''
  nursingCouncilNames: string[] = ['Andhra Pradesh Nurses & Midwives Council', 'Arunachal Pradesh Nursing Council',
    'Assam Nurses Midwives & Health Visitor Council', 'Bihar Nurses Registration Council', 'Chattisgarh Nursing Council',
    'Delhi Nursing Council', 'Goa Nursing Council', 'Gujarat Nursing Council', 'Haryana Nursing Council',
    'Himachal Pradesh Nurses Registration Council', 'Jammu and Kashmir State Paramedical & Nursing Council',
    'Jharkhand Nurses Registration Council', 'Karnataka Nursing Council', 'Kerala Nurses & Midwives Council',
    'Madhya Pradesh Nurses Registration Council', 'Maharashtra Nursing Council', 'Manipur Nursing Council',
    'Meghalaya Nursing Council', 'Mizoram Nursing Council', 'Odisha Nurses & Midwives Registration Council',
    'Punjab Nurses Registration Council', 'Rajasthan Nursing Council', 'Tamil Nadu Nurses & Midwives Council',
    'Tripura Nursing Council', 'Uttar Pradesh Nurses & Midwives Council', 'Uttarakhand Nurses Midwives Council',
    'West Bengal Nursing Council', 'Telangana State Nurses Midwives Auxiliary Nurse Midwives & Health Visitors Council',
    'Sikkim Nursing Council', 'Nagaland Nursing Council']
  filteredOptions: Observable<string[]> | undefined

  constructor(
    private snackBar: MatSnackBar,
    private userProfileSvc: UserProfileService,
    private configSvc: ConfigurationsService,
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private loader: LoaderService,
    private _Activatedroute: ActivatedRoute,
    private btnservice: BtnProfileService
  ) {
    this.createUserForm = new FormGroup({
      firstname: new FormControl('', [Validators.required]),
      middlename: new FormControl('', []),
      surname: new FormControl('', [Validators.required]),
      about: new FormControl(''),
      photo: new FormControl('', []),
      countryCode: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [Validators.required, Validators.pattern(this.phoneNumberPattern)]),
      telephone: new FormControl('', []),
      primaryEmail: new FormControl('', [Validators.required, Validators.email]),
      primaryEmailType: new FormControl(this.assignPrimaryEmailTypeCheckBox(this.ePrimaryEmailType.OFFICIAL), []),
      secondaryEmail: new FormControl('', []),
      nationality: new FormControl('', []),
      dob: new FormControl('', [Validators.required]),
      gender: new FormControl('', []),
      maritalStatus: new FormControl('', []),
      domicileMedium: new FormControl('', []),
      regNurseRegMidwifeNumber: new FormControl('', []),
      nationalUniqueId: new FormControl('', []),
      doctorRegNumber: new FormControl('', []),
      instituteName: new FormControl('', []),
      nursingCouncil: new FormControl('', []),
      knownLanguages: new FormControl([], []),
      residenceAddress: new FormControl('', []),
      category: new FormControl('', []),
      pincode: new FormControl('', [Validators.pattern(this.pincodePattern)]),
      schoolName10: new FormControl('', []),
      yop10: new FormControl('', [Validators.pattern(this.yearPattern)]),
      schoolName12: new FormControl('', []),
      yop12: new FormControl('', [Validators.pattern(this.yearPattern)]),
      degrees: this.fb.array([this.createDegree()]),
      postDegrees: this.fb.array([this.createDegree()]),
      certificationDesc: new FormControl('', []),
      interests: new FormControl('', []),
      hobbies: new FormControl('', []),
      skillAquiredDesc: new FormControl('', []),
      isGovtOrg: new FormControl(false, []),
      orgName: new FormControl('', []),
      orgNameOther: new FormControl('', []),
      industry: new FormControl('', []),
      industryOther: new FormControl('', []),
      designation: new FormControl('', []),
      designationOther: new FormControl('', []),
      location: new FormControl('', []),
      locationOther: new FormControl('', []),
      doj: new FormControl('', []),
      orgDesc: new FormControl('', []),
      payType: new FormControl('', []),
      service: new FormControl('', []),
      cadre: new FormControl('', []),
      allotmentYear: new FormControl('', [Validators.pattern(this.yearPattern)]),
      otherDetailsDoj: new FormControl('', []),
      civilListNo: new FormControl('', []),
      employeeCode: new FormControl('', []),
      otherDetailsOfficeAddress: new FormControl('', []),
      otherDetailsOfficePinCode: new FormControl('', []),
    })
  }

  ngOnInit() {
    // this.unseenCtrlSub = this.createUserForm.valueChanges.subscribe(value => {
    //   console.log('ngOnInit - value', value);
    // })

    this.getUserDetails()
    this.fetchMeta()
  }

  ngAfterViewInit() {
    if (this._Activatedroute.snapshot.queryParams.edit !== '') {
      this.showBackBtn = true
      this.navigatedFromProfile = true
      const indexValue = Number(this._Activatedroute.snapshot.queryParams.edit)
      this.goToNextTabIndex(this.usetMatTab, indexValue)
    }
  }

  private goToNextTabIndex(tabGroup: MatTabGroup, index: number | null) {
    if (!tabGroup || !(tabGroup instanceof MatTabGroup)) { return }

    // const tabCount = tabGroup._tabs.length;
    tabGroup.selectedIndex = index
  }

  fetchMeta() {
    this.userProfileSvc.getMasterNationlity().subscribe(
      data => {
        data.nationalities.map((item: INationality) => {
          this.masterNationalities.push({ name: item.name })
          // this.countries.push({ name: item.name })
          this.countryCodes.push(item.countryCode)
        })
        this.createUserForm.patchValue({
          countryCode: this.countryCodes[0],
        })
        this.onChangesNationality()
      },
      (_err: any) => {
      })

    this.userProfileSvc.getMasterLanguages().subscribe(
      data => {
        this.masterLanguagesEntries = data.languages
        this.onChangesLanuage()
        this.onChangesKnownLanuage()
      },
      (_err: any) => {
      })
    this.userProfileSvc.getProfilePageMeta().subscribe(
      data => {
        this.states = data.states
        this.govtOrgMeta = data.govtOrg
        this.industriesMeta = data.industries
        this.degreesMeta = data.degrees
        this.designationsMeta = data.designations
      },
      (_err: any) => {
      })

    // tslint:disable-next-line: no-non-null-assertion
    this.filteredOptions = this.createUserForm.get('nursingCouncil')!.valueChanges
      .pipe(
        startWith(''),
        map(value => this.councilFilter(value))
      )
  }

  private councilFilter(value: string): string[] {
    if (value) {
      const filterValue = value.toLowerCase()

      return this.nursingCouncilNames.filter(option =>
        option.toLowerCase().includes(filterValue))
    }
    return []
  }

  createDegree(): FormGroup {
    return this.fb.group({
      degree: new FormControl('', []),
      instituteName: new FormControl('', []),
      yop: new FormControl('', [Validators.pattern(this.yearPattern)]),
    })
  }

  createDegreeWithValues(degree: any): FormGroup {
    return this.fb.group({
      degree: new FormControl(degree.degree, []),
      instituteName: new FormControl(degree.instituteName, []),
      yop: new FormControl(degree.yop, [Validators.pattern(this.yearPattern)]),
    })
  }

  public addDegree() {
    this.degrees = this.createUserForm.get('degrees') as FormArray
    this.degrees.push(this.createDegree())
  }

  public addDegreeValues(degree: any) {
    this.degrees = this.createUserForm.get('degrees') as FormArray
    this.degrees.push(this.createDegreeWithValues(degree))
  }

  get degreesControls() {
    const deg = this.createUserForm.get('degrees')
    return (<any>deg)['controls']
  }

  public removeDegrees(i: number) {
    this.degrees.removeAt(i)
  }

  public addPostDegree() {
    this.postDegrees = this.createUserForm.get('postDegrees') as FormArray
    this.postDegrees.push(this.createDegree())
  }

  public addPostDegreeValues(degree: any) {
    this.postDegrees = this.createUserForm.get('postDegrees') as FormArray
    this.postDegrees.push(this.createDegreeWithValues(degree))
  }

  get postDegreesControls() {
    const deg = this.createUserForm.get('postDegrees')
    return (<any>deg)['controls']
  }

  public removePostDegrees(i: number) {
    this.postDegrees.removeAt(i)
  }

  onChangesNationality(): void {
    if (this.createUserForm.get('nationality') != null) {

      // tslint:disable-next-line: no-non-null-assertion
      this.masterNationality = this.createUserForm.get('nationality')!.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          startWith(''),
          map(value => typeof value === 'string' ? value : value.name),
          map(name => name ? this.filterNationality(name) : this.masterNationalities.slice())
        )
    }
  }

  onChangesLanuage(): void {

    // tslint:disable-next-line: no-non-null-assertion
    this.masterLanguages = this.createUserForm.get('domicileMedium')!.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this.filterLanguage(name) : this.masterLanguagesEntries.slice())
      )
  }

  onChangesKnownLanuage(): void {
    // tslint:disable-next-line: no-non-null-assertion
    this.masterKnownLanguages = this.createUserForm.get('knownLanguages')!.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        startWith(''),
        map(value => typeof value === 'string' || 'ILanguages' ? value : value.name),
        map(name => {
          if (name) {
            if (name.constructor === Array) {
              return this.filterMultiLanguage(name)
            }
            return this.filterLanguage(name)
          }
          return this.masterLanguagesEntries.slice()
        })
      )
  }

  private filterNationality(name: string): INation[] {
    if (name) {
      const filterValue = name.toLowerCase()
      return this.masterNationalities.filter(option => option.name.toLowerCase().includes(filterValue))
    }
    return this.masterNationalities
  }

  private filterLanguage(name: string): ILanguages[] {
    if (name) {
      const filterValue = name.toLowerCase()
      return this.masterLanguagesEntries.filter(option => option.name.toLowerCase().includes(filterValue))
    }
    return this.masterLanguagesEntries
  }

  private filterMultiLanguage(name: string[]): ILanguages[] {
    if (name) {
      const filterValue = name.map(n => n.toLowerCase())
      return this.masterLanguagesEntries.filter(option => {
        // option.name.toLowerCase().includes(filterValue))
        filterValue.map(f => {
          return option.name.toLowerCase().includes(f)
        })
      })
    }
    return this.masterLanguagesEntries
  }

  ngOnDestroy() {
    if (this.unseenCtrlSub && !this.unseenCtrlSub.closed) {
      this.unseenCtrlSub.unsubscribe()
    }
  }

  public selectKnowLanguage(data: any) {
    const value: ILanguages = data.option.value
    if (!this.selectedKnowLangs.includes(value)) {
      this.selectedKnowLangs.push(data.option.value)
    }
    this.knownLanguagesInputRef.nativeElement.value = ''
    if (this.createUserForm.get('knownLanguages')) {
      // tslint:disable-next-line: no-non-null-assertion
      // this.createUserForm.get('knownLanguages')!.setValue(null)
    }
  }

  public removeKnowLanguage(lang: any) {
    const index = this.selectedKnowLangs.indexOf(lang)

    if (index >= 0) {
      this.selectedKnowLangs.splice(index, 1)
    }

  }

  add(event: MatChipInputEvent): void {
    const input = event.input
    const value = event.value as unknown as ILanguages

    // Add our fruit
    if ((value || '')) {
      this.selectedKnowLangs.push(value)
    }

    // Reset the input value
    if (input) {
      input.value = ''
    }
    this.knownLanguagesInputRef.nativeElement.value = ''

    // if (this.createUserForm.get('knownLanguages')) {
    //   // tslint:disable-next-line: no-non-null-assertion
    //   this.createUserForm.get('knownLanguages')!.setValue(null)
    // }
  }

  addPersonalInterests(event: MatChipInputEvent): void {
    const input = event.input
    const value = event.value as unknown as IChipItems

    if ((value || '')) {
      this.personalInterests.push(value)
    }

    if (input) {
      input.value = ''
    }

    // this.knownLanguagesInputRef.nativeElement.value = ''
    if (this.createUserForm.get('interests')) {
      // tslint:disable-next-line: no-non-null-assertion
      this.createUserForm.get('interests')!.setValue(null)
    }
  }

  addHobbies(event: MatChipInputEvent) {
    const input = event.input
    const value = event.value as unknown as IChipItems

    if ((value || '')) {
      this.selectedHobbies.push(value)
    }

    if (input) {
      input.value = ''
    }

    if (this.createUserForm.get('hobbies')) {
      // tslint:disable-next-line: no-non-null-assertion
      this.createUserForm.get('hobbies')!.setValue(null)
    }
  }

  removePersonalInterests(interest: any) {
    const index = this.personalInterests.indexOf(interest)

    if (index >= 0) {
      this.personalInterests.splice(index, 1)
    }
  }

  removeHobbies(interest: any) {
    const index = this.selectedHobbies.indexOf(interest)

    if (index >= 0) {
      this.selectedHobbies.splice(index, 1)
    }
  }

  getUserDetails() {
    if (this.configSvc.profileDetailsStatus) {
      if (this.configSvc.userProfile) {
        if (this.configSvc.userProfile.email && this.configSvc.userProfile.email.endsWith('aastrika.in')) {
          this.mobileNumberLogin = true
          this.createUserForm.controls.mobile.disable()
          this.createUserForm.controls.countryCode.disable()
          this.mobileLoginNumber = this.configSvc.userProfile.email.substr(0, 10)
          this.createUserForm.patchValue({
            mobile: Number(this.mobileLoginNumber),
          })
        }
        this.userProfileSvc.getUserdetailsFromRegistry().subscribe(
          data => {
            if (data && data.length) {
              this.isEditable = true
              const academics = this.populateAcademics(data[0])
              this.setDegreeValuesArray(academics)
              this.setPostDegreeValuesArray(academics)
              const organisations = this.populateOrganisationDetails(data[0])
              this.constructFormFromRegistry(data[0], academics, organisations)
              this.populateChips(data[0])

            } else {
              this.router.navigate(['app/user-profile/chatbot'])
            }
          },
          (_err: any) => {
          })
      }
    } else {
      if (this.configSvc.userProfile && this.configSvc.userProfile.email) {
        if (this.configSvc.userProfile.email.endsWith('aastrika.in')) {
          this.mobileNumberLogin = true
          this.createUserForm.controls.mobile.disable()
          this.createUserForm.controls.countryCode.disable()
          this.mobileLoginNumber = this.configSvc.userProfile.email.substr(0, 10)
          this.createUserForm.patchValue({
            mobile: Number(this.mobileLoginNumber),
          })
        }
        this.userProfileSvc.getUserdetails(this.configSvc.userProfile.email).subscribe(
          data => {
            if (data && data.length) {
              this.createUserForm.patchValue({
                firstname: data[0].first_name,
                surname: data[0].last_name,
                primaryEmail: data[0].email,
              })
            }
          },
          () => {
            // console.log('err :', err)
          })
      }
    }
  }

  private populateOrganisationDetails(data: any) {
    let org = {
      isGovtOrg: true,
      orgName: '',
      industry: '',
      designation: '',
      location: '',
      responsibilities: '',
      doj: '',
      orgDesc: '',
      completePostalAddress: '',
      orgNameOther: '',
      industryOther: '',
      designationOther: '',
    }
    if (data && data.professionalDetails && data.professionalDetails.length > 0) {
      const organisation = data.professionalDetails[0]
      org = {
        isGovtOrg: organisation.organisationType,
        orgName: organisation.name,
        orgNameOther: organisation.nameOther,
        industry: organisation.industry,
        industryOther: organisation.industryOther,
        designation: organisation.designation,
        designationOther: organisation.designationOther,
        location: organisation.location,
        responsibilities: organisation.responsibilities,
        doj: this.getDateFromText(organisation.doj),
        orgDesc: organisation.description,
        completePostalAddress: organisation.completePostalAddress,
      }
      if (organisation.organisationType === 'Government') {
        org.isGovtOrg = true
      } else {
        org.isGovtOrg = false
      }
    }

    return org
  }

  private populateAcademics(data: any) {
    const academics: NsUserProfileDetails.IAcademics = {
      X_STANDARD: {
        schoolName10: '',
        yop10: '',
      },
      XII_STANDARD: {
        schoolName12: '',
        yop12: '',
      },
      degree: [],
      postDegree: [],
    }
    if (data.academics) {
      if (Array.isArray(data.academics)) {
        data.academics.map((item: any) => {
          switch (item.type) {
            case 'X_STANDARD': academics.X_STANDARD.schoolName10 = item.nameOfInstitute
              academics.X_STANDARD.yop10 = item.yearOfPassing
              break
            case 'XII_STANDARD': academics.XII_STANDARD.schoolName12 = item.nameOfInstitute
              academics.XII_STANDARD.yop12 = item.yearOfPassing
              break
            case 'GRADUATE': academics.degree.push({
              degree: item.nameOfQualification,
              instituteName: item.nameOfInstitute,
              yop: item.yearOfPassing,
            })
              break
            case 'POSTGRADUATE': academics.postDegree.push({
              degree: item.nameOfQualification,
              instituteName: item.nameOfInstitute,
              yop: item.yearOfPassing,
            })
              break
          }
        })
      }
    }
    return academics
  }

  private populateChips(data: any) {
    if (data.personalDetails.knownLanguages && data.personalDetails.knownLanguages.length) {
      data.personalDetails.knownLanguages.map((lang: ILanguages) => {
        if (lang) {
          this.selectedKnowLangs.push(lang)
        }
      })
    }
    if (data.interests.professional && data.interests.professional.length) {
      data.interests.professional.map((interest: IChipItems) => {
        if (interest) {
          this.personalInterests.push(interest)
        }
      })
    }
    if (data.interests.hobbies && data.interests.hobbies.length) {
      data.interests.hobbies.map((interest: IChipItems) => {
        if (interest) {
          this.selectedHobbies.push(interest)
        }
      })
    }
  }

  private filterPrimaryEmailType(data: any) {
    if (data.personalDetails.officialEmail) {
      this.isOfficialEmail = true
    } else {
      this.isOfficialEmail = false
    }
    // this.cd.detectChanges()
    return this.ePrimaryEmailType.OFFICIAL
    // this.assignPrimaryEmailTypeCheckBox(this.ePrimaryEmailType.PERSONAL)
    // return this.ePrimaryEmailType.PERSONAL
  }

  private constructFormFromRegistry(data: any, academics: NsUserProfileDetails.IAcademics, organisation: any) {
    this.createUserForm.patchValue({
      firstname: data.personalDetails.firstname,
      middlename: data.personalDetails.middlename,
      surname: data.personalDetails.surname,
      about: data.personalDetails.about,
      photo: data.photo,
      dob: this.getDateFromText(data.personalDetails.dob),
      nationality: data.personalDetails.nationality,
      domicileMedium: data.personalDetails.domicileMedium,
      regNurseRegMidwifeNumber: data.personalDetails.regNurseRegMidwifeNumber,
      nationalUniqueId: data.personalDetails.nationalUniqueId,
      doctorRegNumber: data.personalDetails.doctorRegNumber,
      instituteName: data.personalDetails.instituteName,
      nursingCouncil: data.personalDetails.nursingCouncil,
      gender: data.personalDetails.gender,
      maritalStatus: data.personalDetails.maritalStatus,
      category: data.personalDetails.category,
      knownLanguages: data.personalDetails.knownLanguages,
      countryCode: data.personalDetails.countryCode,
      mobile: data.personalDetails.mobile,
      telephone: data.personalDetails.telephone,
      primaryEmail: data.personalDetails.primaryEmail,
      secondaryEmail: data.personalDetails.personalEmail,
      primaryEmailType: this.filterPrimaryEmailType(data),
      residenceAddress: data.personalDetails.postalAddress,
      pincode: data.personalDetails.pincode,
      schoolName10: academics.X_STANDARD.schoolName10,
      yop10: academics.X_STANDARD.yop10,
      schoolName12: academics.XII_STANDARD.schoolName12,
      yop12: academics.XII_STANDARD.yop12,
      isGovtOrg: organisation.isGovtOrg,
      orgName: organisation.orgName,
      industry: organisation.industry,
      designation: organisation.designation,
      location: organisation.location,
      doj: organisation.doj,
      orgDesc: organisation.orgDesc,
      orgNameOther: organisation.orgNameOther,
      industryOther: organisation.industryOther,
      designationOther: organisation.designationOther,
      service: data.employmentDetails.service,
      cadre: data.employmentDetails.cadre,
      allotmentYear: data.employmentDetails.allotmentYearOfService,
      otherDetailsDoj: this.getDateFromText(data.employmentDetails.dojOfService),
      payType: data.employmentDetails.payType,
      civilListNo: data.employmentDetails.civilListNo,
      employeeCode: data.employmentDetails.employeeCode,
      otherDetailsOfficeAddress: data.employmentDetails.officialPostalAddress,
      otherDetailsOfficePinCode: data.employmentDetails.pinCode,
      skillAquiredDesc: data.skills.additionalSkills,
      certificationDesc: data.skills.certificateDetails,
    },
                                   {
        emitEvent: true,
      })
    /* tslint:enable */
    this.cd.detectChanges()
    this.cd.markForCheck()
    this.setDropDownOther(organisation)
    this.setProfilePhotoValue(data)
  }

  setProfilePhotoValue(data: any) {
    this.photoUrl = data.photo || undefined
  }

  setDropDownOther(organisation?: any) {
    if (organisation.designation === 'Other') {
      this.showDesignationOther = true
    }
    if (organisation.orgName === 'Other') {
      this.showOrgnameOther = true
    }

    if (organisation.industry === 'Other') {
      this.showIndustryOther = true
    }
  }

  private setDegreeValuesArray(academics: any) {
    this.degrees = this.createUserForm.get('degrees') as FormArray
    this.degrees.removeAt(0)
    academics.degree.map((degree: any) => { this.addDegreeValues(degree as FormArray) })
  }

  private setPostDegreeValuesArray(academics: any) {
    this.postDegrees = this.createUserForm.get('postDegrees') as FormArray
    this.postDegrees.removeAt(0)
    academics.postDegree.map((degree: any) => { this.addPostDegreeValues(degree as FormArray) })
  }

  private constructReq(form: any) {
    const profileReq = {
      photo: form.value.photo,
      personalDetails: {
        firstname: form.value.firstname,
        middlename: form.value.middlename,
        surname: form.value.surname,
        about: form.value.about,
        dob: form.value.dob,
        nationality: form.value.nationality,
        domicileMedium: form.value.domicileMedium,
        regNurseRegMidwifeNumber: form.value.regNurseRegMidwifeNumber,
        nationalUniqueId: form.value.nationalUniqueId,
        doctorRegNumber: form.value.doctorRegNumber,
        instituteName: form.value.instituteName,
        nursingCouncil: form.value.nursingCouncil,
        gender: form.value.gender,
        maritalStatus: form.value.maritalStatus,
        category: form.value.category,
        knownLanguages: form.value.knownLanguages,
        countryCode: form.value.countryCode,
        mobile: form.value.mobile,
        telephone: form.value.telephone,
        primaryEmail: form.value.primaryEmail,
        officialEmail: '',
        personalEmail: '',
        postalAddress: form.value.residenceAddress,
        pincode: form.value.pincode,
      },
      academics: this.getAcademics(form),
      employmentDetails: {
        service: form.value.service,
        cadre: form.value.cadre,
        allotmentYearOfService: form.value.allotmentYear,
        dojOfService: form.value.otherDetailsDoj,
        payType: form.value.payType,
        civilListNo: form.value.civilListNo,
        employeeCode: form.value.employeeCode,
        officialPostalAddress: form.value.otherDetailsOfficeAddress,
        pinCode: form.value.otherDetailsOfficePinCode,
      },
      professionalDetails: [
        ...this.getOrganisationsHistory(form),
      ],
      skills: {
        additionalSkills: form.value.skillAquiredDesc,
        certificateDetails: form.value.certificationDesc,
      },
      interests: {
        professional: form.value.interests,
        hobbies: form.value.hobbies,
      },
    }
    if (form.value.primaryEmailType === this.ePrimaryEmailType.OFFICIAL) {
      profileReq.personalDetails.officialEmail = form.value.primaryEmail
    } else {
      profileReq.personalDetails.officialEmail = ''
    }
    profileReq.personalDetails.personalEmail = form.value.secondaryEmail

    return profileReq
  }

  private getOrganisationsHistory(form: any) {
    const organisations: any = []
    const org = {
      organisationType: '',
      name: form.value.orgName,
      nameOther: form.value.orgNameOther,
      industry: form.value.industry,
      industryOther: form.value.industryOther,
      designation: form.value.designation,
      designationOther: form.value.designationOther,
      location: form.value.location,
      responsibilities: '',
      doj: form.value.doj,
      description: form.value.orgDesc,
      completePostalAddress: '',
      additionalAttributes: {},
    }
    if (form.value.isGovtOrg) {
      org.organisationType = 'Government'
    } else {
      org.organisationType = 'Non-Government'
    }
    organisations.push(org)
    return organisations
  }

  private getAcademics(form: any) {
    const academics = []
    academics.push(this.getClass10(form))
    academics.push(this.getClass12(form))
    academics.push(...this.getDegree(form, 'GRADUATE'))
    academics.push(...this.getPostDegree(form, 'POSTGRADUATE'))
    return academics
  }

  getClass10(form: any): IProfileAcademics {
    return ({
      nameOfQualification: '',
      type: 'X_STANDARD',
      nameOfInstitute: form.value.schoolName10,
      yearOfPassing: `${form.value.yop10}`,
    })
  }

  getClass12(form: any): IProfileAcademics {
    return ({
      nameOfQualification: '',
      type: 'XII_STANDARD',
      nameOfInstitute: form.value.schoolName12,
      yearOfPassing: `${form.value.yop12}`,
    })
  }

  getDegree(form: any, degreeType: string): IProfileAcademics[] {
    const formatedDegrees: IProfileAcademics[] = []
    form.value.degrees.map((degree: any) => {
      formatedDegrees.push({
        nameOfQualification: degree.degree,
        type: degreeType,
        nameOfInstitute: degree.instituteName,
        yearOfPassing: `${degree.yop}`,
      })
    })
    return formatedDegrees
  }

  getPostDegree(form: any, degreeType: string): IProfileAcademics[] {
    const formatedDegrees: IProfileAcademics[] = []
    form.value.postDegrees.map((degree: any) => {
      formatedDegrees.push({
        nameOfQualification: degree.degree,
        type: degreeType,
        nameOfInstitute: degree.instituteName,
        yearOfPassing: `${degree.yop}`,
      })
    })
    return formatedDegrees
  }

  async onSubmit(form: any) {
    // DO some customization on the input data
    form.value.knownLanguages = this.selectedKnowLangs
    form.value.interests = this.personalInterests
    form.value.hobbies = this.selectedHobbies
    form.value.dob = changeformat(new Date(`${form.value.dob}`))
    form.value.allotmentYear = `${form.value.allotmentYear}`
    form.value.civilListNo = `${form.value.civilListNo}`
    form.value.employeeCode = `${form.value.employeeCode}`
    form.value.otherDetailsOfficePinCode = `${form.value.otherDetailsOfficePinCode}`
    if (form.value.otherDetailsDoj) {
      form.value.otherDetailsDoj = changeformat(new Date(`${form.value.otherDetailsDoj}`))
    }
    if (form.value.doj) {
      form.value.doj = changeformat(new Date(`${form.value.doj}`))
    }

    this.uploadSaveData = true

    // Construct the request structure for open saber
    const profileRequest = this.constructReq(form)
    // manipulate request to remove gender, category & marital status

    // if (profileRequest.personalDetails.gender === '') {
    //   delete profileRequest.personalDetails.gender
    // }
    // if (profileRequest.personalDetails.category === '') {
    //   delete profileRequest.personalDetails.category
    // }
    // if (profileRequest.personalDetails.maritalStatus === '') {
    //   delete profileRequest.personalDetails.maritalStatus
    // }
    // if (profileRequest.personalDetails.telephone === '') {
    //   delete profileRequest.personalDetails.telephone
    // }
    // tslint:disable-next-line
    const fields = ['category', 'countryCode', 'dob', 'officialEmail', 'firstName', 'gender', 'maritalStatus', 'middleName', 'mobile', 'nursingCouncil', 'nationality', 'pincode', 'postalAddress', 'surname', 'telephone']
    profileRequest.personalDetails.officialEmail = profileRequest.personalDetails.primaryEmail
    fields.map((item: any) => {
      // tslint:disable-next-line
      if (!profileRequest.personalDetails[item as keyof IUserProfileFields2] || profileRequest.personalDetails[item as keyof IUserProfileFields2] === '') {
        delete profileRequest.personalDetails[item as keyof IUserProfileFields2]
      }
    })
    if (profileRequest.personalDetails.telephone) {
      profileRequest.personalDetails.telephone = String(profileRequest.personalDetails.telephone)
    }
    this.userProfileSvc.updateProfileDetails(profileRequest).subscribe(
      () => {
        this.updateBtnProfileName(profileRequest.personalDetails.firstname)
        form.reset()
        this.uploadSaveData = false
        this.configSvc.profileDetailsStatus = true
        this.openSnackbar(this.toastSuccess.nativeElement.value)
        if (!this.navigatedFromProfile) {
          this.router.navigate(['page', 'home'])
        } else {
          const selectedCourse = localStorage.getItem('selectedCourse')
          if (selectedCourse) {
            this.router.navigateByUrl(selectedCourse)
          } else {
            this.router.navigate(['app', 'profile', 'dashboard'])
          }
        }

      },
      () => {
        this.openSnackbar(this.toastError.nativeElement.value)
        this.uploadSaveData = false
      })
  }

  updateBtnProfileName(fn: string) {
    this.btnservice.changeName(fn)
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  formNext() {
    if (this.selectedIndex === 3) {
      this.selectedIndex = 0
    } else {
      this.selectedIndex = this.selectedIndex + 1
    }
  }
  public navigateBack() {
    this.router.navigate(['page', 'home'])
  }

  public officialEmailCheck() {
    this.isOfficialEmail = !this.isOfficialEmail
    this.assignPrimaryEmailType(this.isOfficialEmail)
  }

  private assignPrimaryEmailType(isOfficialEmail: boolean) {
    if (isOfficialEmail) {
      this.createUserForm.patchValue({
        primaryEmailType: this.ePrimaryEmailType.OFFICIAL,
      })
    } else {
      this.createUserForm.patchValue({
        primaryEmailType: this.ePrimaryEmailType.PERSONAL,
      })
    }
  }

  private assignPrimaryEmailTypeCheckBox(primaryEmailType: any) {
    if (primaryEmailType === this.ePrimaryEmailType.OFFICIAL) {
      this.isOfficialEmail = true
    } else {
      this.isOfficialEmail = false
    }
    // this.assignPrimaryEmailType(this.isOfficialEmail)
  }

  private getDateFromText(dateString: string): any {
    if (dateString) {
      const splitValues: string[] = dateString.split('-')
      const [dd, mm, yyyy] = splitValues
      const dateToBeConverted = `${yyyy}-${mm}-${dd}`
      return new Date(dateToBeConverted)
    }
    return ''
  }

  otherDropDownChange(value: any, field: string) {
    if (field === 'orgname' && value !== 'Other') {
      this.showOrgnameOther = false
      this.createUserForm.controls['orgNameOther'].setValue('')
    }
    if (field === 'industry' && value !== 'Other') {
      this.showIndustryOther = false
      this.createUserForm.controls['industryOther'].setValue('')
    }
    if (field === 'designation' && value !== 'Other') {
      this.showDesignationOther = false
      this.createUserForm.controls['designationOther'].setValue('')
    }
  }

  uploadProfileImg(file: File) {
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (
      !(
        IMAGE_SUPPORT_TYPES.indexOf(
          `.${fileName
            .toLowerCase()
            .split('.')
            .pop()}`,
        ) > -1
      )
    ) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.size > IMAGE_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    const dialogRef = this.dialog.open(ImageCropComponent, {
      width: '70%',
      data: {
        isRoundCrop: true,
        imageFile: file,
        width: 265,
        height: 150,
        isThumbnail: true,
        imageFileName: fileName,
      },
    })

    dialogRef.afterClosed().subscribe({
      next: (result: File) => {
        if (result) {
          formdata.append('content', result, fileName)
          this.loader.changeLoad.next(true)
          const reader = new FileReader()
          reader.readAsDataURL(result)
          reader.onload = _event => {
            this.photoUrl = reader.result
            if (this.createUserForm.get('photo') !== undefined) {
              // tslint:disable-next-line: no-non-null-assertion
              this.createUserForm.get('photo')!.setValue(this.photoUrl)
            }
          }
        }
      },
    })
  }
}

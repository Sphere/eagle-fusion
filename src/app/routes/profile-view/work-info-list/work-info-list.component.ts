import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input, DestroyRef, inject } from '@angular/core'
import { ConfigurationsService, LoggerService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '@ws-widget/collection'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { get } from 'lodash'
import { NsUserProfileDetails } from '@ws/app/src/lib/routes/user-profile/models/NsUserProfile'
import * as _ from 'lodash'
import { HttpClient } from '@angular/common/http'
import { LanguageService } from '../../../services/language.service'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

@Component({
  selector: 'ws-work-info-list',
  templateUrl: './work-info-list.component.html',
  styleUrls: ['./work-info-list.component.scss'],
})
export class WorkInfoListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef)

  professions = ['Healthcare Worker', 'Healthcare Volunteer', 'ASHA', 'Student', 'Faculty', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  healthVolunteerProfessions = ['Anganwadi Workers', 'Mukhya Sevika (MS)', 'Child Development Project Officer (CDPO)', 'District Programme Officer (DPO)', 'BSC Nurse', 'Others']
  healthWorkerProfessions = ['Midwives', 'GNM', 'Doctors', 'Public Health Professionals', 'Paramedical', 'Pharmacist', 'Community Health Officer (CHO)', 'BSC Nurse', 'ANM/MPW', 'Others']
  ashaList = ['ASHA']
  facultyList = ['Nursing Faculty', 'Medical Faculty', 'Other']
  studentList = ['Bsc nursing', 'GNM', 'ANM/MPW', 'Midwife', 'Medical Student', 'Other']
  OthersList = ['Mother/ Family Members', 'Asha Facilitator', 'Asha Trainer', 'Other']

  districtUrl = '../../../fusion-assets/files/district.json'

  userProfileData!: IUserProfileDetailsFromRegistry
  ekshamataData: any

  showbackButton = false
  showLogOutIcon = false
  trigerrNavigation = true

  @Output() passProfession = new EventEmitter<string>()
  @Input() isEkshamata: boolean = false
  @Input() data: any

  isEditableForSphere = false

  personalDetailForm: UntypedFormGroup

  userID = ''
  ePrimaryEmailType = NsUserProfileDetails.EPrimaryEmailType
  rnFieldDisabled = true
  disticts: any
  selectedBg: any
  enableSubmit = false

  errorMsg = '' // used in template
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>

  constructor(
    public configSvc: ConfigurationsService,
    public userProfileSvc: UserProfileService,
    public valueSvc: ValueService,
    public contentSvc: WidgetContentService,
    public UserAgentResolverService: UserAgentResolverService,
    public snackBar: MatSnackBar,
    public http: HttpClient,
    private languageSvc: LanguageService,
    private logger: LoggerService
  ) {
    this.personalDetailForm = new UntypedFormGroup({
      profession: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      designation: new UntypedFormControl(),
      professionOtherSpecify: new UntypedFormControl(),
      regNurseRegMidwifeNumber: new UntypedFormControl('', [Validators.pattern(/[^\s]/)]),
      orgType: new UntypedFormControl(),
      orgOtherSpecify: new UntypedFormControl(),
      organizationName: new UntypedFormControl(),
      block: new UntypedFormControl(),
      subcentre: new UntypedFormControl(),
      professSelected: new UntypedFormControl(),
      orgName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      instituteName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      courseName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      locationselect: new UntypedFormControl(),
      selectBackground: new UntypedFormControl(),
      nameOther: new UntypedFormControl(),
    })
  }

  ngOnInit() {
    this.logger.log(this.data)
    this.getUserDetails()
    this.valueSvc.isXSmall$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isXSmall => {
        if (isXSmall) {
          this.showbackButton = true
          this.showLogOutIcon = false
        } else {
          this.showbackButton = false
          this.showLogOutIcon = false
        }
      })

    if (this.isEkshamata) {
      this.personalDetailForm.disable()
    }
  }

  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        async (data: any) => {
          if (data) {
            this.isEditableForSphere = await this.UserAgentResolverService.isEditableForSphere(data)
            if (this.isEditableForSphere) {
              this.personalDetailForm.enable()
            } else {
              this.personalDetailForm.disable()
            }
            const newData = data.profileDetails.profileReq
            this.ekshamataData = data
            this.userProfileData = newData

            if (newData && newData.professionalDetails) {
              const pd0 = newData.professionalDetails[0]

              this.personalDetailForm.patchValue({
                profession: pd0.profession,
                professionOtherSpecify: pd0.professionOtherSpecify,
                orgType: pd0.orgType,
                orgOtherSpecify: pd0.orgOtherSpecify,
                organizationName: pd0.name,
                block: pd0.block,
                subcentre: pd0.subcentre,
                designation: pd0.designation,
                orgName: pd0.name,
                courseName: pd0.qualification,
                selectBackground: pd0.selectBackground,
                nameOther: pd0.nameOther,
                instituteName: pd0.instituteName,
                regNurseRegMidwifeNumber: newData.personalDetails.regNurseRegMidwifeNumber,
              })
              if (pd0.profession === 'Healthcare Worker') {
                this.personalDetailForm.patchValue({
                  regNurseRegMidwifeNumber: newData.personalDetails.regNurseRegMidwifeNumber,
                })
                if (pd0.designation === 'ANM') {
                  this.personalDetailForm.patchValue({ designation: 'ANM/MPW' })
                }
              }

              if (newData.personalDetails.postalAddress) {
                const cName = newData.personalDetails.postalAddress
                const csplit = cName.split(',')
                const country = (csplit[0] || '').trim()
                if (country !== 'India') {
                  this.professions = ['Healthcare Worker', 'Healthcare Volunteer', 'Student', 'Faculty', 'Others']
                }
              }
              if (pd0.profession === 'ASHA' || (pd0.profession === 'Others' && (this.selectedBg === 'Asha Facilitator' || this.selectedBg === 'Asha Trainer'))) {
                this.selectedBg = pd0.selectBackground
                this.personalDetailForm.controls.locationselect.setValue(pd0.locationselect)

                const { state } = this.extractStateDistrictFromPostalAddress(newData.personalDetails.postalAddress)
                this.loadDistrictsByState(state)
              }
            }
          }
        })
    }
  }

  professionalChange(value: any) {
    this.logger.log('degree', value, this.userProfileData, this.personalDetailForm)
    const form = this.personalDetailForm
    const controls = form.controls
    const profile = this.userProfileData
    const profDetails = profile?.professionalDetails?.[0]

      ;['designation', 'orgType', 'orgOtherSpecify'].forEach(key => {
        controls[key]?.clearValidators()
        controls[key]?.updateValueAndValidity()
      })
      /** RESET COMMON VALUES */
      ;['designation', 'orgType', 'selectBackground'].forEach(key => {
        controls[key]?.setValue(null)
      })

    switch (value) {
      case 'Healthcare Worker':
        controls.designation.setValidators([Validators.required])
        controls.orgType.setValidators([Validators.required])
        break
      case 'Healthcare Volunteer':
        break
      case 'ASHA':
        controls.designation.clearValidators()
        controls.instituteName.clearValidators()
        controls.instituteName.updateValueAndValidity()
        controls.block.setValue(null)
        controls.subcentre.setValue(null)

        const cName = profile.personalDetails.postalAddress
        this.logger.log(cName)

        const { state, dist } = this.extractStateDistrictFromPostalAddress(cName)
        const location = profDetails.locationselect !== undefined ? profDetails.locationselect : dist
        controls.locationselect.setValue(location)

        if (state) {
          this.loadDistrictsByState(state, (districts) => {
            if (districts.includes(dist)) {
              form.get('locationselect')?.setValue(dist)
            }
          })
        }
        break
      case 'Faculty':
      case 'Student':
        break
      case 'Others':
        if (!profDetails.selectBackground) {
          controls.selectBackground.setValue(null)
        }
        if (!profile.personalDetails.regNurseRegMidwifeNumber) {
          controls.regNurseRegMidwifeNumber.setValue(null)
        }
        break

      default:
        controls.regNurseRegMidwifeNumber.setValue(null)
        controls.orgType.setValue(null)
    }

    if (value === profDetails.profession) {
      controls.designation.setValue(profDetails.designation)
    }
    controls.designation.updateValueAndValidity()
    controls.orgType.updateValueAndValidity()
  }

  shouldShowField(field: any): boolean {
    if (!field.showIf) return true
    const showIf = field.showIf
    const form = this.personalDetailForm
    /** STEP 1: Profession check (mandatory gate) */
    const professionValue = form.get('profession')?.value
    if (showIf.profession) {
      const allowedProfessions = showIf.profession

      const professionMatched = Array.isArray(allowedProfessions)
        ? allowedProfessions.includes(professionValue)
        : professionValue === allowedProfessions

      if (!professionMatched) {
        return false
      }
    }

    /** STEP 2: Check remaining showIf keys */
    return Object.keys(showIf)
      .filter(key => key !== 'profession')
      .every(key => {
        // Only evaluate selectBackground if profession === 'Others'
        if (professionValue !== 'Others' && key === 'selectBackground') {
          return true
        }
        const controlValue = form.get(key)?.value
        const expectedValues = showIf[key]

        if (controlValue == null) return false
        return Array.isArray(expectedValues)
          ? expectedValues.includes(controlValue)
          : controlValue === expectedValues
      })
  }

  getOptions(field: any): any[] {
    if (!field.options) {
      return []
    }
    if (field.options == 'professionalOptions') {
      switch (this.personalDetailForm.get('profession')?.value) {
        case 'Healthcare Worker':
          return this.healthWorkerProfessions
        case 'Healthcare Volunteer':
          return this.healthVolunteerProfessions
        case 'Student':
          return this.studentList
        case 'Faculty':
          return this.facultyList
        case 'Others':
          return this.OthersList
        default:
          return []
      }
    } else {
      return (this as any)[field.options] || []
    }
  }

  handleChange(event: any, field: any) {
    if (field.key === 'designation') {
      this.professionSelect(event.value)
    } else if (field.key === 'orgType') {
      this.orgTypeSelect(event.value)
    } else if (field.key === 'selectBackground') {
      this.chooseBackground(event.value)
    }
  }

  professionSelect(option: any) {
    const controls = this.personalDetailForm?.controls
    if (option === 'Others') {
      controls.professionOtherSpecify.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)])
    } else {
      controls.professionOtherSpecify.clearValidators()
      controls.professionOtherSpecify.setValue(null)
    }
    // if (option === 'Midwives' || option === 'ANM' || option === 'GNM' || option === 'BSC Nurse' || option === 'ANM/MPW') {
    //   this.rnFieldDisabled = false
    // } else {
    //   controls.regNurseRegMidwifeNumber.setValue(null)
    //   this.rnFieldDisabled = true
    // }
  }

  orgTypeSelect(option: any) {
    const controls = this.personalDetailForm?.controls
    controls.orgType.setValue(option !== 'null' ? option : null)
    if (option === 'Others') {
      controls.orgOtherSpecify.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)])
    } else {
      controls.orgOtherSpecify.clearValidators()
      controls.orgOtherSpecify.setValue('')
    }
  }

  chooseBackground(data: any) {
    const controls = this.personalDetailForm?.controls
    this.logger.log(data)
    this.selectedBg = data
    switch (data) {

      case 'Mother/Family Members':
        this.enableSubmit = false
        break
      case 'Asha Facilitator':
      case 'Asha Trainer':
        this.enableSubmit = true
        controls.block.setValue(null)
        controls.subcentre.setValue(null)

        const cName = this.userProfileData.personalDetails.postalAddress
        this.logger.log(cName)
        const { state, dist } = this.extractStateDistrictFromPostalAddress(cName)
        const location = this.userProfileData.professionalDetails[0].locationselect !== undefined
          ? this.userProfileData.professionalDetails[0].locationselect
          : dist
        controls.locationselect.setValue(location)
        this.loadDistrictsByState(state)
        break
      case 'Other':
        controls.designation.setValue(null)
    }

  }

  private extractStateDistrictFromPostalAddress(postalAddress?: string): { state: string; dist: string } {
    let state = ''
    let dist = ''
    if (postalAddress) {
      const csplit = postalAddress.split(',')
      state = (csplit[1] || '').trim()
      dist = (csplit[2] || '').trim()
    }
    return { state, dist }
  }

  private loadDistrictsByState(state: string, onDone?: (districts: any[]) => void) {
    if (!state) return

    this.http.get(this.districtUrl).subscribe((statesdata: any) => {
      statesdata.states.map((item: any) => {
        if (item.state === state) {
          this.disticts = item.districts
          if (onDone) onDone(this.disticts)
        }
      })
    })
  }

  onSubmit(form: any) {
    // this.logger.log("degree", value, this.userProfileData)
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }

    // ✅ Use LanguageService instead of checking location.href
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : this.languageSvc?.getCurrentLanguage() || 'en'

    let profileRequest = this.constructReq(form)
    if (form.value.locationselect) {
      let cName
      if (this.userProfileData.personalDetails!.postalAddress) {
        cName = this.userProfileData.personalDetails!.postalAddress!.includes('India')
      }

      this.logger.log(cName)
      if (cName) {
        let cName1 = this.userProfileData.personalDetails.postalAddress
        let csplit = cName1.split(',')
        let country = csplit[0].trim()
        let state = csplit[1].trim()
        profileRequest.profileReq.personalDetails.postalAddress = country + ',' + state + ',' + form.value.locationselect
      }
    }
    profileRequest.profileReq.personalDetails["profileLocation"] = 'sphere-web/work-info-list'

    const obj = {
      preferences: {
        language: local === 'en' ? 'en' : 'hi',
      },
      userSource: this.configSvc.unMappedUser?.profileDetails?.userSource || null,
    }
    profileRequest = Object.assign(profileRequest, obj)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: { ...profileRequest, profileLocation: 'sphere-web/work-info-list', },
      },
    }
    this.logger.log('request update', reqUpdate, get(form.value, 'profession'))
    this.passProfession.emit(get(form.value, 'profession'))
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          this.logger.log(res, 'res')
          if (local === 'en') {
            this.openSnackbar(this.toastSuccess.nativeElement.value)
          } else {
            this.openSnackbar('उपयोगकर्ता प्रोफ़ाइल विवरण सफलतापूर्वक अपडेट किया गया!')
          }
          const ob = {
            type: 'work',
            edit: 'save',

          }
          this.contentSvc.changeWork(ob)
        }
      })
  }

  public constructReq(form: any) {
    const userid = this.userProfileData.userId || this.userProfileData.id || ''
    const userAgent = this.UserAgentResolverService.getUserAgent()
    const userCookie = this.UserAgentResolverService.generateCookie()
    const profileReq = {
      id: userid,
      userId: userid,
      photo: form.value.photo,
      personalDetails: {
        firstname: this.userProfileData.personalDetails.firstname,
        middlename: this.userProfileData.personalDetails.middlename,
        surname: this.userProfileData.personalDetails.surname,
        about: this.userProfileData.personalDetails.about,
        dob: this.userProfileData.personalDetails.dob,
        nationality: this.userProfileData.personalDetails.nationality,
        domicileMedium: this.userProfileData.personalDetails.domicileMedium,
        regNurseRegMidwifeNumber: form.value.regNurseRegMidwifeNumber,
        nationalUniqueId: this.userProfileData.personalDetails.nationalUniqueId,
        doctorRegNumber: this.userProfileData.personalDetails.doctorRegNumber,
        instituteName: this.userProfileData.personalDetails.instituteName,
        nursingCouncil: this.userProfileData.personalDetails.nursingCouncil,
        gender: this.userProfileData.personalDetails.gender,
        maritalStatus: this.userProfileData.personalDetails.maritalStatus,
        category: this.userProfileData.personalDetails.category,
        knownLanguages: this.userProfileData.personalDetails.knownLanguages,
        countryCode: this.userProfileData.personalDetails.countryCode,
        mobile: this.userProfileData.personalDetails.mobile,
        telephone: this.userProfileData.personalDetails.telephone,
        primaryEmail: this.userProfileData.personalDetails.primaryEmail,
        officialEmail: '',
        personalEmail: '',
        postalAddress: this.userProfileData.personalDetails.postalAddress,
        pincode: this.userProfileData.personalDetails.pincode,
        osName: this.userProfileData.personalDetails.osName ? this.userProfileData.personalDetails.osName : userAgent.OS,
        browserName: this.userProfileData.personalDetails.browserName ? this.userProfileData.personalDetails.browserName : userAgent.browserName,
        userCookie: this.userProfileData.personalDetails.userCookie ? this.userProfileData.personalDetails.userCookie : userCookie,
      },
      academics: this.userProfileData.academics,
      employmentDetails: {
        service: this.userProfileData.personalDetails.service,
        cadre: this.userProfileData.personalDetails.cadre,
        allotmentYearOfService: this.userProfileData.personalDetails.allotmentYear,
        dojOfService: this.userProfileData.personalDetails.otherDetailsDoj,
        payType: this.userProfileData.personalDetails.payType,
        civilListNo: this.userProfileData.personalDetails.civilListNo,
        employeeCode: this.userProfileData.personalDetails.employeeCode,
        officialPostalAddress: this.userProfileData.personalDetails.otherDetailsOfficeAddress,
        pinCode: this.userProfileData.personalDetails.otherDetailsOfficePinCode,
      },
      professionalDetails: [
        ...this.getOrganisationsHistory(form),
      ],
      skills: {
        additionalSkills: this.userProfileData.personalDetails.skillAquiredDesc,
        certificateDetails: this.userProfileData.personalDetails.certificationDesc,
      },
      interests: {
        professional: this.userProfileData.personalDetails.interests,
        hobbies: this.userProfileData.personalDetails.hobbies,
      },
    }
    if (this.userProfileData.personalDetails.primaryEmailType === this.ePrimaryEmailType.OFFICIAL) {
      profileReq.personalDetails.officialEmail = this.userProfileData.personalDetails.primaryEmail
    } else {
      profileReq.personalDetails.officialEmail = ''
    }
    profileReq.personalDetails.personalEmail = this.userProfileData.personalDetails.secondaryEmail
    return { profileReq }
  }

  private getOrganisationsHistory(form: any) {
    this.logger.log(form.value, form.value.nameOther)
    const organisations: any = []
    const org = {
      name: form.value.orgName,
      orgType: form.value.orgType,
      orgOtherSpecify: form.value.orgOtherSpecify,
      industry: form.value.industry,
      industryOther: form.value.industryOther,
      designation: form.value.designation,
      profession: form.value.profession,
      location: form.value.location,
      responsibilities: '',
      doj: form.value.doj,
      description: form.value.orgDesc,
      completePostalAddress: '',
      additionalAttributes: {},
      osid: _.get(this.userProfileData, 'professionalDetails[0].osid') || undefined,
      block: get(form.value, 'block') ? form.value.block : this.userProfileData.professionalDetails[0].block,
      subcentre: get(form.value, 'subcentre') ? form.value.subcentre : this.userProfileData.professionalDetails[0].subcentre,
      nameOther: get(form.value, 'nameOther') ? form.value.nameOther : '',
      professionOtherSpecify: get(form.value, 'professionOtherSpecify') ? form.value.professionOtherSpecify : this.userProfileData.professionalDetails[0].professionOtherSpecify,
      locationselect: form.value.locationselect,
      qualification: get(form.value, 'courseName') ? form.value.courseName : this.userProfileData.professionalDetails[0].qualification,
      instituteName: get(form.value, 'instituteName') ? form.value.instituteName : this.userProfileData.professionalDetails[0].instituteName,
      selectBackground: form.value.selectBackground,
      organizationName: form.value.organizationName,
    }
    organisations.push(org)
    return organisations
  }

  public openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
}

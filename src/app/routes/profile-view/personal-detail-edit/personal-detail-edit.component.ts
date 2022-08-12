import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import moment from 'moment'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api'
import { ILanguages, IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { AppDateAdapter, APP_DATE_FORMATS, changeformat } from '../../../../../project/ws/app/src/public-api'
import { DateAdapter, MatChipInputEvent, MatSnackBar, MAT_DATE_FORMATS } from '@angular/material'
import { constructReq } from '../request-util'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators'
import { ENTER, COMMA } from '@angular/cdk/keycodes'

@Component({
  selector: 'ws-personal-detail-edit',
  templateUrl: './personal-detail-edit.component.html',
  styleUrls: ['./personal-detail-edit.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
})
export class PersonalDetailEditComponent implements OnInit {
  maxDate = new Date()
  minDate = new Date(1900, 1, 1)
  invalidDob = false
  personalDetailForm: FormGroup
  userProfileData!: IUserProfileDetailsFromRegistry
  academicsArray: any[] = []
  profileUserName: any
  userID = ''
  savebtnDisable = true
  orgTypeField = false
  orgOthersField = false
  selectedKnowLangs: ILanguages[] = []
  masterKnownLanguages: Observable<ILanguages[]> | undefined
  masterLanguagesEntries!: ILanguages[]
  masterLanguages: Observable<ILanguages[]> | undefined
  separatorKeysCodes: number[] = [ENTER, COMMA]
  rnShow = false
  professionOtherField = false
  startDate = new Date(1999, 0, 1)

  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('knownLanguagesInput', { static: true }) knownLanguagesInputRef!: ElementRef<HTMLInputElement>
  professions = ['Healthcare Worker', 'Healthcare Volunteer', 'Mother/Family Member', 'Student', 'Faculty', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']

  constructor(private configSvc: ConfigurationsService,
              private userProfileSvc: UserProfileService,
              private router: Router,
              private matSnackBar: MatSnackBar
  ) {
    this.personalDetailForm = new FormGroup({
      userName: new FormControl('', [Validators.required]),
      dob: new FormControl('', [Validators.required]),
      profession: new FormControl(),
      professionOtherSpecify: new FormControl(),
      regNurseRegMidwifeNumber: new FormControl(),
      orgType: new FormControl(),
      orgOtherSpecify: new FormControl(),
      organizationName: new FormControl(),
      nationality: new FormControl(),
      domicileMedium: new FormControl(),
      gender: new FormControl(),
      maritalStatus: new FormControl(),
      knownLanguages: new FormControl([], []),
      mobile: new FormControl(),
      postalAddress: new FormControl(),
      pincode: new FormControl(),
    })
  }

  ngOnInit() {
    this.getUserDetails()
    this.fetchMeta()
  }

  fetchMeta() {
    this.userProfileSvc.getMasterLanguages().subscribe(
      data => {
        this.masterLanguagesEntries = data.languages
        this.onChangesLanuage()
        this.onChangesKnownLanuage()
      },
      (_err: any) => {
      })
  }

  onChangesLanuage(): void {

    // tslint:disable-next-line: no-non-null-assertion
    this.masterLanguages = this.personalDetailForm.get('domicileMedium')!.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        startWith(''),
        map(value => typeof (value) === 'string' ? value : (value && value.name ? value.name : '')),
        map(name => name ? this.filterLanguage(name) : this.masterLanguagesEntries.slice())
      )
  }

  onChangesKnownLanuage(): void {
    // tslint:disable-next-line: no-non-null-assertion
    this.masterKnownLanguages = this.personalDetailForm.get('knownLanguages')!.valueChanges
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

  private filterLanguage(name: string): ILanguages[] {
    if (name) {
      const filterValue = name.toLowerCase()
      return this.masterLanguagesEntries.filter(option => option.name.toLowerCase().includes(filterValue))
    }
    return this.masterLanguagesEntries
  }

  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
            this.updateForm()
            this.populateChips(this.userProfileData)
          }
        })
    }
  }

  public selectKnowLanguage(data: any) {
    this.savebtnDisable = false
    const value: ILanguages = data.option.value
    if (!this.selectedKnowLangs.includes(value)) {
      this.selectedKnowLangs.push(data.option.value)
    }
    this.knownLanguagesInputRef.nativeElement.value = ''
  }

  public removeKnowLanguage(lang: any) {
    this.savebtnDisable = false
    const index = this.selectedKnowLangs.indexOf(lang)

    if (index >= 0) {
      this.selectedKnowLangs.splice(index, 1)
    }
  }

  add(event: MatChipInputEvent): void {
    this.savebtnDisable = false
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
  }

  private populateChips(data: any) {
    if (data.personalDetails.knownLanguages && data.personalDetails.knownLanguages.length) {
      data.personalDetails.knownLanguages.map((lang: ILanguages) => {
        if (lang) {
          this.selectedKnowLangs.push(lang)
        }
      })
    }
  }

  professionalChange(value: any) {
    this.savebtnDisable = false
    if (value === 'Healthcare Worker') {
      this.rnShow = true
      this.orgTypeField = false
      this.professionOtherField = false
    } else if (value === 'Healthcare Volunteer') {
      this.orgTypeField = false
      this.professionOtherField = false
      this.rnShow = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
    } else if (value === 'Others') {
      this.rnShow = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.professionOtherField = true
      this.orgTypeField = false
    } else {
      this.orgTypeField = true
      this.rnShow = false
      this.professionOtherField = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.personalDetailForm.controls.orgType.setValue(null)
    }
  }

  fieldChange() {
    this.savebtnDisable = false
  }

  onDateChange(event: any) {
    const customerDate = moment(event)
    const dateNow = moment(new Date())
    const duration = moment.duration(dateNow.diff(customerDate))
    if (duration.asYears() > 18) {
      this.invalidDob = false
      this.savebtnDisable = false
    } else {
      this.invalidDob = true
      this.savebtnDisable = true
    }
  }

  updateForm() {
    if (this.userProfileData && this.userProfileData.personalDetails) {
      const data = this.userProfileData

      this.profileUserName = `${data.personalDetails.firstname} `
      if (data.personalDetails.middlename) {
        this.profileUserName += `${data.personalDetails.middlename} `
      }
      if (data.personalDetails.surname) {
        this.profileUserName += `${data.personalDetails.surname}`
      }

      data.professionalDetails[0].orgType === 'Others' ? this.orgOthersField = true : this.orgOthersField = false
      data.professionalDetails[0].profession === 'Others' ? this.professionOtherField = true : this.professionOtherField = false
      data.professionalDetails[0].profession === 'Healthcare Worker' ? this.rnShow = true : this.rnShow = false

      this.personalDetailForm.patchValue({
        userName: this.profileUserName,
        dob: this.getDateFromText(data.personalDetails.dob),
        profession: data.professionalDetails[0].profession,
        professionOtherSpecify: data.professionalDetails[0].professionOtherSpecify,
        regNurseRegMidwifeNumber: data.personalDetails.regNurseRegMidwifeNumber,
        orgType: data.professionalDetails[0].orgType,
        orgOtherSpecify: data.professionalDetails[0].orgOtherSpecify,
        organizationName: data.professionalDetails[0].name,
        nationality: data.personalDetails.nationality,
        domicileMedium: data.personalDetails.domicileMedium,
        gender: data.personalDetails.gender,
        maritalStatus: data.personalDetails.maritalStatus,
        knownLanguages: data.personalDetails.knownLanguages,
        mobile: data.personalDetails.mobile,
        postalAddress: data.personalDetails.postalAddress,
        pincode: data.personalDetails.pincode,
      })
    }
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

  orgTypeSelect(option: any) {
    this.savebtnDisable = false
    if (option !== 'null') {
      this.personalDetailForm.controls.orgType.setValue(option)
    } else {
      this.personalDetailForm.controls.orgType.setValue(null)
    }

    if (option === 'Others') {
      this.orgOthersField = true
      this.personalDetailForm.controls.orgOtherSpecify.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)])
    } else {
      this.orgOthersField = false
      this.personalDetailForm.controls.orgOtherSpecify.clearValidators()
      this.personalDetailForm.controls.orgOtherSpecify.setValue('')
    }
  }

  onSubmit(form: any) {
    if (form.value.dob) {
      form.value.dob = changeformat(new Date(`${form.value.dob}`))
    }
    form.value.knownLanguages = this.selectedKnowLangs

    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const profileRequest = constructReq(form, this.userProfileData)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: profileRequest,
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          this.openSnackbar(this.toastSuccess.nativeElement.value)
          this.router.navigate(['/app/profile-view'])
        }
      })
  }

  private openSnackbar(message: string) {
    this.matSnackBar.open(message)
  }

}

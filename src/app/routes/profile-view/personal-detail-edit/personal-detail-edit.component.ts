import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import moment from 'moment'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { ILanguages, IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../../project/ws/app/src/public-api'
import { DateAdapter, MatChipInputEvent, MatDialog, MatSnackBar, MAT_DATE_FORMATS } from '@angular/material'
import { constructReq } from '../request-util'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators'
import { ENTER, COMMA } from '@angular/cdk/keycodes'
import { LanguageDialogComponent } from '../../language-dialog/language-dialog.component'
import upperFirst from 'lodash/upperFirst'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { HttpClient } from '@angular/common/http'
@Component({
  selector: 'ws-personal-detail-edit',
  templateUrl: './personal-detail-edit.component.html',
  styleUrls: ['./personal-detail-edit.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDetailEditComponent implements OnInit, AfterViewInit, AfterViewChecked {
  maxDate = new Date()
  minDate = new Date(1900, 1, 1)
  invalidDob = false
  personalDetailForm: FormGroup
  userProfileData!: IUserProfileDetailsFromRegistry
  academicsArray: any[] = []
  // profileUserName: any
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
  showbackButton = false
  showLogOutIcon = false
  trigerrNavigation = true
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('knownLanguagesInput', { static: true }) knownLanguagesInputRef!: ElementRef<HTMLInputElement>
  professions = ['Healthcare Worker', 'Healthcare Volunteer', 'ASHA', 'Student', 'Faculty', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  langList = ['English', 'Hindi']
  langDialog: any
  preferedLanguage: any = 'English'
  loadDob = false
  showDesignation = false
  disticts: any
  countries: any
  states: any
  countryUrl = '/fusion-assets/files/country.json'
  districtUrl = '/fusion-assets/files/district.json'
  stateUrl = '/fusion-assets/files/state.json'
  selectDisable = true
  countryName: boolean = false
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private matSnackBar: MatSnackBar,
    public dialog: MatDialog,
    private valueSvc: ValueService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private UserAgentResolverService: UserAgentResolverService,
    private http: HttpClient
  ) {
    this.personalDetailForm = new FormGroup({
      firstname: new FormControl({ value: '', disabled: true }, [Validators.required]),
      surname: new FormControl({ value: '', disabled: true }, [Validators.required]),
      // userName: new FormControl('', [Validators.required]),
      dob: new FormControl('', [Validators.required]),
      profession: new FormControl(),
      designation: new FormControl(),
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
      knownLanguage: new FormControl(this.preferedLanguage),
      mobile: new FormControl({ value: '', disabled: true }),
      email: new FormControl({ value: '', disabled: true }),
      postalAddress: new FormControl(),
      pincode: new FormControl(),
      languages: new FormControl(),
      block: new FormControl(),
      subcentre: new FormControl(),
      country: new FormControl(),
      state: new FormControl(),
      distict: new FormControl()
    })

    // this.personalDetailForm.patchValue({ knownLanguages: this.preferedLanguage })
  }

  ngOnInit() {
    this.fetchMeta()
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      console.log(isXSmall, 'ppp')
      if (isXSmall) {
        this.showbackButton = true
        this.showLogOutIcon = false

      } else {
        this.showbackButton = false
        this.showLogOutIcon = false
      }
    })
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
    this.http.get(this.countryUrl).subscribe((data: any) => {
      this.countries = data.nationalities
    })

    this.http.get(this.stateUrl).subscribe((data: any) => {
      console.log(data)
      this.states = data.states
    })
  }
  stateSelect(option: any) {
    this.http.get(this.districtUrl).subscribe((statesdata: any) => {
      statesdata.states.map((item: any) => {
        if (item.state === option) {
          this.disticts = item.districts
        }
      })
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
  countrySelect(option: any) {
    this.setCountryCode(option)
    if (option === 'India') {
      this.selectDisable = false
    } else {
      this.selectDisable = true
      this.personalDetailForm.controls.state.setValue(null)
      this.personalDetailForm.controls.distict.setValue(null)
    }
  }
  setCountryCode(country: string) {
    const selectedCountry = this.countries.filter((e: any) => e.name.toLowerCase() === country.toLowerCase())
    this.personalDetailForm.controls.countryCode.setValue(selectedCountry[0].countryCode)
  }
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
            console.log(data.profileDetails.profileReq.personalDetails.dob, ';')
            this.updateForm()
            if (data.profileDetails && data.profileDetails.preferences && data.profileDetails.preferences!.language === 'hi') {
              this.personalDetailForm.patchValue({
                knownLanguage: 'हिंदी',
              })
            } else {
              this.personalDetailForm.patchValue({
                knownLanguage: 'English',
              })
            }

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
    console.log(value)
    this.savebtnDisable = false
    if (value === 'Healthcare Worker') {
      this.rnShow = true
      this.showDesignation = true
      this.orgTypeField = false
      this.professionOtherField = false
    } else if (value === 'Healthcare Volunteer') {
      this.orgTypeField = false
      this.professionOtherField = false
      this.rnShow = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
    } else if (value === 'Faculty') {
      this.orgOthersField = false
      this.orgTypeField = false
      this.rnShow = false
    } else if (value === 'Others') {
      this.rnShow = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.professionOtherField = true
      this.orgTypeField = false
    } else if (value === 'Student') {
      this.orgOthersField = false
      this.orgTypeField = false
      this.rnShow = false
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
      // console.log(data.professionalDetails[0], 'o')
      // this.profileUserName = `${data.personalDetails.firstname} `
      // if (data.personalDetails.middlename) {
      //   this.profileUserName += `${data.personalDetails.middlename} `
      // }
      // if (data.personalDetails.surname) {
      //   this.profileUserName += `${data.personalDetails.surname}`
      // }

      // if (data.personalDetails.dob) {

      //   this.getDateFromText(data.personalDetails.dob)
      // }

      if (data.personalDetails && data) {
        console.log(data.personalDetails)
        this.personalDetailForm.patchValue({
          // userName: this.profileUserName,
          firstname: data.personalDetails.firstname,
          surname: data.personalDetails.surname,
          dob: data.personalDetails.dob ? this.getDateFromText(data.personalDetails.dob) : '',
          regNurseRegMidwifeNumber: data.personalDetails.regNurseRegMidwifeNumber,
          nationality: data.personalDetails.nationality,
          domicileMedium: data.personalDetails.domicileMedium,
          gender: data.personalDetails.gender,
          maritalStatus: data.personalDetails.maritalStatus,
          knownLanguages: data.personalDetails.knownLanguages,
          mobile: data.personalDetails.mobile,
          email: data.personalDetails.primaryEmail,
          postalAddress: data.personalDetails.postalAddress,
          pincode: data.personalDetails.pincode,
        })
        this.countryName = data.personalDetails.postalAddress.includes('India')
        console.log(this.countryName)
        if (this.countryName) {
          let cName = data.personalDetails.postalAddress
          let csplit = cName.split(',')
          this.stateSelect(csplit[1].trim())
          console.log(csplit)
          this.personalDetailForm.patchValue({
            country: csplit[0],
            state: csplit[1].trim(),
            distict: csplit[2].trim()
          })
        } else {
          let cName = data.personalDetails.postalAddress
          let csplit = cName.split(',')
          console.log(csplit)
          this.personalDetailForm.patchValue({
            country: csplit[0]
          })
        }
      }
      if (data && data.professionalDetails) {
        (data.professionalDetails[0].orgType === 'Others' && data.professionalDetails[0].orgOtherSpecify) ? this.orgOthersField = true : this.orgOthersField = false;
        (data.professionalDetails[0].profession === 'Others' && data.professionalDetails[0].professionOtherSpecify) ? this.professionOtherField = true : this.professionOtherField = false;
        (data.professionalDetails[0].designation) ? this.showDesignation = true : this.showDesignation = false
        data.professionalDetails[0].profession === 'Healthcare Worker' ? this.rnShow = true : this.rnShow = false
        this.personalDetailForm.patchValue({
          profession: data.professionalDetails[0].profession,
          professionOtherSpecify: data.professionalDetails[0].professionOtherSpecify,
          orgType: data.professionalDetails[0].orgType,
          orgOtherSpecify: data.professionalDetails[0].orgOtherSpecify,
          organizationName: data.professionalDetails[0].name,
          block: data.professionalDetails[0].block,
          subcentre: data.professionalDetails[0].subcentre,
          designation: data.professionalDetails[0].designation,
        })
      }
    }

    this.loadDob = this.userProfileData.personalDetails.dob ? true : false
  }

  private getDateFromText(dateString: string): any {
    if (dateString) {
      const splitValues: string[] = dateString.split('-')
      const [dd, mm, yyyy] = splitValues
      const dateToBeConverted = `${dd}/${mm}/${yyyy}`
      return dateToBeConverted
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
    // if (form.value.dob) {
    //   form.value.dob = changeformat(new Date(`${form.value.dob}`))
    // }
    console.log(form.value)
    console.log(this.userProfileData)
    if (form.value.dob.includes('undefined')) {
      const data = form.value.dob.replace(/\/undefined/g, '')
      console.log(data)
      form.value.dob = data
    }
    console.log(form.value)
    form.value.knownLanguages = this.selectedKnowLangs

    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const userAgent = this.UserAgentResolverService.getUserAgent()
    const userCookie = this.UserAgentResolverService.generateCookie()
    let profileRequest = constructReq(form.value, this.userProfileData, userAgent, userCookie)
    const obj = {
      preferences: {
        language: this.personalDetailForm.controls.knownLanguage.value === 'English' ? 'en' : 'hi',
      },
      personalDetails: profileRequest.profileReq.personalDetails,
      // osName: userAgent.OS,
      // browserName: userAgent.browserName,
      // userCookie: userCookie,
    }
    profileRequest = Object.assign(profileRequest, obj)

    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: profileRequest,
      },
    }

    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(async (res: any) => {
      console.log(res, 'trye')
      let result = await res
      if (result) {
        this.openSnackbar(this.toastSuccess.nativeElement.value)
        this.router.navigate(['/app/profile-view'])
      }
    })
  }

  private openSnackbar(message: string) {
    this.matSnackBar.open(message)
  }

  changeLanguage() {
    this.langDialog = this.dialog.open(LanguageDialogComponent, {
      panelClass: 'language-modal',
      data: {
        selected: this.preferedLanguage,
      },
    })

    this.langDialog.afterClosed().subscribe((result: any) => {
      console.log(result, !!result)
      if (result) {
        this.preferedLanguage = result
        this.personalDetailForm.controls.
          knownLanguage.setValue(upperFirst(result.lang))

        if (this.configSvc.userProfileV2) {
          let user: any
          const userid = this.configSvc.userProfileV2.userId
          const userAgent = this.UserAgentResolverService.getUserAgent()
          const userCookie = this.UserAgentResolverService.generateCookie()
          this.userProfileSvc.getUserdetailsFromRegistry(userid).subscribe((data: any) => {
            user = data
            const obj = {
              preferences: {
                language: result.id,
              },
              osName: userAgent.OS,
              browserName: userAgent.browserName,
              userCookie,
            }
            const userdata = Object.assign(user['profileDetails'], obj)
            // this.chosenLanguage = path.value
            const reqUpdate = {
              request: {
                userId: userid,
                profileDetails: userdata,
              },
            }
            this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
              () => {
                if (result.id === 'en') {
                  // this.chosenLanguage = ''
                  window.location.assign(`${location.origin}/page/home`)
                  // window.location.reload(true)
                } else {
                  // window.location.reload(true)
                  window.location.assign(`${location.origin}/${result.id}/page/home`)
                }
              },
              () => {
              })
          })
        }
      }
    })
  }

  dobData(event: any) {
    console.log(event)
    this.personalDetailForm.patchValue({
      dob: event,
    })
    console.log(this.personalDetailForm)
    this.savebtnDisable = false
  }
  ngAfterViewInit(): void {
    this.getUserDetails()
  }
  ngAfterViewChecked(): void {
    this.changeDetectorRef.markForCheck()
    this.changeDetectorRef.detectChanges()
  }
}

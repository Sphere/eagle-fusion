import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
// import { Router } from '@angular/router'
import { ActivatedRoute } from '@angular/router'

import { ConfigurationsService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '@ws-widget/collection'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
// import { constructReq } from '../request-util'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import { NsUserProfileDetails } from '@ws/app/src/lib/routes/user-profile/models/NsUserProfile'
import * as _ from 'lodash'
import { HttpClient } from '@angular/common/http'
import { BnrcmodalComponent } from '../bnrc-popup/bnrc-modal-component'
import { LoaderService } from '../../../../project/ws/author/src/public-api'
import { startWith, map, tap } from 'rxjs/operators'
import { Observable } from 'rxjs'

@Component({
  selector: 'ws-bnrc-register',
  templateUrl: './bnrc-register.component.html',
  styleUrls: ['./bnrc-register.component.scss'],
})

export class BnrcRegisterComponent implements OnInit {
  professions = ['Student', 'Faculty'] // 'In Service'
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  inserviceList = ['Public Health Facility', 'Private Health Facility']
  facultyList = ['Diploma', 'Degree']
  courseSelection = ['ANM']
  districtUrl = '../../../fusion-assets/files/district.json'
  Position = ['ANM']//, 'Staff Nurse', 'Doctor'
  instituteType = ['Government', 'Private']
  serviceType = ['Regular', 'Contractual']
  userProfileData!: IUserProfileDetailsFromRegistry
  showbackButton = false
  @Output() passProfession = new EventEmitter<string>();
  showLogOutIcon = false
  trigerrNavigation = true
  bnrcDetailForm: FormGroup
  orgTypeField = false
  orgOthersField = false
  HealthcareWorker = false
  HealthcareVolunteer = false
  professionOtherField = false
  Student = false
  Faculty = false
  inService = false
  inServiceGNM = false
  publicHealthFacility = false
  privateHealthFacility = false
  otpPage = false
  showDesignation = false
  showAshaField = false
  professionOthersField = false
  userID = ''
  ePrimaryEmailType = NsUserProfileDetails.EPrimaryEmailType
  rnFieldDisabled = true
  disticts: any
  selectedBg: any
  enableSubmit = false
  hideAsha = false
  districts: any = [
    "Araria",
    "Arwal",
    "Aurangabad",
    "Banka",
    "Begusarai",
    "Bhagalpur",
    "Bhojpur",
    "Buxar",
    "Darbhanga",
    "East Champaran (Motihari)",
    "Gaya",
    "Gopalganj",
    "Jamui",
    "Jehanabad",
    "Kaimur (Bhabua)",
    "Katihar",
    "Khagaria",
    "Kishanganj",
    "Lakhisarai",
    "Madhepura",
    "Madhubani",
    "Munger (Monghyr)",
    "Muzaffarpur",
    "Nalanda",
    "Nawada",
    "Patna",
    "Purnia (Purnea)",
    "Rohtas",
    "Saharsa",
    "Samastipur",
    "Saran",
    "Sheikhpura",
    "Sheohar",
    "Sitamarhi",
    "Siwan",
    "Supaul",
    "Vaishali",
    "West Champaran"
  ]
  institutes: any = [];
  filteredInstitutes!: Observable<any[]>
  isSubmitting = false;
  isInservice = false;
  isANM = false
  message: string = ''
  instituteNameUrl = 'https://aastar-app-assets.s3.ap-south-1.amazonaws.com/bnrc-institute.json';
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  hrmsErr: boolean = false
  bnrcErr: boolean = false
  showMessage: boolean = false
  constructor(
    public configSvc: ConfigurationsService,
    public userProfileSvc: UserProfileService,
    // private router: Router,
    public valueSvc: ValueService,
    public contentSvc: WidgetContentService,
    public UserAgentResolverService: UserAgentResolverService,
    public snackBar: MatSnackBar,
    public http: HttpClient,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private loader: LoaderService,
    private route: ActivatedRoute
  ) {
    this.bnrcDetailForm = this.formBuilder.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
      email: new FormControl('', [Validators.pattern(/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      role: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)]),
      district: new FormControl('', [Validators.required]),
      instituteName: new FormControl('', []),
      courseSelection: new FormControl('', []),
      instituteType: new FormControl('', []),
      bnrcRegistrationNumber: new FormControl('', []),
      hrmsId: new FormControl('', []),
      facultyType: new FormControl('', []),
      facilityName: new FormControl('', []),
      roleForInService: new FormControl('', []),
      publicFacilityType: new FormControl('', []),
      privateFacilityType: new FormControl('', []),
      serviceType: new FormControl('', []),
    })
  }
  // Define the form group creation in a separate method
  createFormGroup(): FormGroup {
    return this.formBuilder.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
      email: new FormControl('', [Validators.pattern(/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      role: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)]),
      district: new FormControl('', [Validators.required]),
      instituteName: new FormControl('', []),
      courseSelection: new FormControl('', []),
      instituteType: new FormControl('', []),
      bnrcRegistrationNumber: new FormControl('', []),
      hrmsId: new FormControl('', []),
      facultyType: new FormControl('', []),
      facilityName: new FormControl('', []),
      roleForInService: new FormControl('', []),
      publicFacilityType: new FormControl('', []),
      privateFacilityType: new FormControl('', []),
      serviceType: new FormControl('', []),
    })
  }

  // Use the resetForm method to reset the form
  resetForm(): void {
    this.bnrcDetailForm.reset()
    this.Student = false
    this.Faculty = false
    this.inService = false
    this.publicHealthFacility = false
    this.privateHealthFacility = false
    this.bnrcDetailForm = this.createFormGroup() // Create a new form group with initial values and validators
  }

  ngOnInit() {
    this.http.get(this.instituteNameUrl).subscribe((instituteData: any) => {
      this.institutes = instituteData.institueName // Store the institutes data
      this.filteredInstitutes = this.bnrcDetailForm.controls['instituteName'].valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value)),
        tap(filtered => {
          if (filtered.length === 0 && this.bnrcDetailForm.get('instituteName')?.value) {
            this.bnrcDetailForm.get('instituteName')?.setValue(null)
            this.bnrcDetailForm.get('instituteName')?.setErrors({ invalidInstitute: true })
          } else {
            this.bnrcDetailForm.get('instituteName')?.setErrors(null)
          }
        })
      )
    })
    this.route.queryParams.subscribe(params => {
      const service = params['service']
      if (service === 'inservice') {
        this.isANM = true
        this.isInservice = true
        this.professions = ['In Service']
        this.bnrcDetailForm.controls.role.setValue('In Service')
        this.professionalChange('Public Health Facility')
        this.bnrcDetailForm.controls.roleForInService.setValue('Public Health Facility')
      } else {
        this.isANM = false
        this.isInservice = false
        this.bnrcDetailForm.controls.role.setValue(null)
        this.bnrcDetailForm.controls.publicFacilityType.setValue(null)
        this.bnrcDetailForm.controls.roleForInService.setValue(null)
      }
      if (service === 'Student') {
        this.professionalChange('Student')
        this.bnrcDetailForm.controls.role.setValue('Student')
        this.bnrcDetailForm.controls.courseSelection.setValue('ANM')
        this.bnrcDetailForm.controls.instituteType.setValue('N/A')
      }
      if (service === 'Faculty') {
        this.professionalChange('Faculty')
        this.bnrcDetailForm.controls.role.setValue('Faculty')
        this.bnrcDetailForm.controls.courseSelection.setValue('ANM')
        this.bnrcDetailForm.controls.instituteType.setValue('N/A')
        this.bnrcDetailForm.controls.facultyType.setValue('N/A')
      }
      if (service === 'GNM-Bihar') {
        this.isANM = false
        this.isInservice = true
        this.inServiceGNM = true
        this.professions = ['In Service']
        this.bnrcDetailForm.controls.role.setValue('In Service')
        this.professionalChange('Private Health Facility')
        this.bnrcDetailForm.controls.roleForInService.setValue('Private Health Facility')
      }
    })
    console.log("districts", this.districts)
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall) {
        this.showbackButton = true
        this.showLogOutIcon = false

      } else {
        this.showbackButton = false
        this.showLogOutIcon = false
      }
    })
  }
  private _filter(value: string): { name: string }[] {
    console.log("value", value)
    if (value) {
      const filterValue = value.toLowerCase().replace(/,/g, '') // Remove commas from input
      return this.institutes.filter(institute =>
        institute.name.toLowerCase().replace(/,/g, '').includes(filterValue)
      )
    }
    return []
  }


  assignFields(fieldName: string, value: string, event: any) {
    console.log(fieldName, value, event)
  }
  serviceTypeChange(value: string) {
    console.log("regulating service type", value)
    const hrmsIdControl = this.bnrcDetailForm.get('hrmsId')
    const bnrcRegistrationNumberControl = this.bnrcDetailForm.get('bnrcRegistrationNumber')

    if (hrmsIdControl && bnrcRegistrationNumberControl) {
      if (value === 'Regular') {
        this.hrmsErr = true
        this.bnrcErr = false
        // hrmsIdControl.setValidators([Validators.required])
        // bnrcRegistrationNumberControl.clearValidators()
      } else {
        this.hrmsErr = false
        this.bnrcErr = true
        // hrmsIdControl.clearValidators()
        // bnrcRegistrationNumberControl.setValidators([Validators.required])
      }

      // hrmsIdControl.updateValueAndValidity()
      // bnrcRegistrationNumberControl.updateValueAndValidity()
    }
  }
  professionalChange(value: any) {
    this.showMessage = false
    this.showDesignation = true
    const form = this.bnrcDetailForm

    const clearValidatorsAndReset = (fields: string[]) => {
      fields.forEach(field => {
        const control = form.get(field)
        if (control) {
          control.clearValidators()
          control.setValue(null)
          control.updateValueAndValidity()
        }
      })
    }

    const setValidators = (field: string, validators: any[]) => {
      const control = form.get(field)
      if (control) {
        control.setValidators(validators)
        control.updateValueAndValidity()
      }
    }

    switch (value) {
      case 'Student': {
        this.Student = true
        this.Faculty = false
        this.inService = false
        this.publicHealthFacility = false
        this.privateHealthFacility = false

        setValidators('instituteName', [Validators.required])
        setValidators('courseSelection', [Validators.required])

        clearValidatorsAndReset([
          'facultyType', 'bnrcRegistrationNumber', 'publicFacilityType', 'roleForInService',
          'serviceType', 'facilityName', 'privateFacilityType', 'hrmsId'
        ])
        break
      }

      case 'Faculty': {
        this.Student = false
        this.Faculty = true
        this.inService = false
        this.publicHealthFacility = false
        this.privateHealthFacility = false
        this.hrmsErr = false
        this.bnrcErr = true

        setValidators('instituteName', [Validators.required])
        setValidators('facultyType', [Validators.required])
        setValidators('bnrcRegistrationNumber', [Validators.required])

        clearValidatorsAndReset([
          'courseSelection', 'publicFacilityType', 'roleForInService', 'serviceType',
          'facilityName', 'privateFacilityType', 'hrmsId'
        ])
        break
      }

      case 'In Service':
      case 'inServiceGNM': {
        this.Student = false
        this.Faculty = false
        this.inService = true
        this.publicHealthFacility = false
        this.privateHealthFacility = false

        form.controls.courseSelection.setValue(null)
        this.inServiceGNM = value === 'inServiceGNM'
        break
      }

      case 'Public Health Facility': {
        this.Student = false
        this.Faculty = false
        this.inService = false
        this.publicHealthFacility = true
        this.privateHealthFacility = false

        form.controls.publicFacilityType.setValue(this.inServiceGNM ? 'GNM-Bihar' : 'ANM')

        setValidators('publicFacilityType', [Validators.required])
        setValidators('roleForInService', [Validators.required])
        setValidators('serviceType', [Validators.required])
        setValidators('facilityName', [Validators.required])

        clearValidatorsAndReset([
          'courseSelection', 'facultyType', 'privateFacilityType', 'instituteType', 'instituteName'
        ])
        break
      }

      case 'Private Health Facility': {
        this.Student = false
        this.Faculty = false
        this.inService = false
        this.publicHealthFacility = false
        this.privateHealthFacility = true

        form.controls.privateFacilityType.setValue(this.inServiceGNM ? 'GNM-Bihar' : 'ANM')

        setValidators('privateFacilityType', [Validators.required])
        setValidators('facilityName', [Validators.required])

        clearValidatorsAndReset([
          'courseSelection', 'facultyType', 'hrmsId', 'publicFacilityType',
          'serviceType', 'instituteName', 'instituteType'
        ])
        break
      }

      default: {
        this.Student = false
        this.Faculty = false
        this.inService = false
        this.publicHealthFacility = false
        this.privateHealthFacility = false
        break
      }
    }

    form.updateValueAndValidity()
  }

  checkInstitute() {
    if (this.bnrcDetailForm.controls.instituteName.value) {
      const instituteName = this.bnrcDetailForm.controls.instituteName.value.trim().toLowerCase()
      console.log("instituteName", instituteName, this.institutes)

      const isPresent = this.institutes.some((institute: any) =>
        institute.name.trim().toLowerCase() === instituteName
      )
      if (isPresent) {
        console.log("correct value selected")
      } else {
        this.bnrcDetailForm.get('instituteName')?.setValue(null)
        this.bnrcDetailForm.get('instituteName')?.setErrors({ invalidInstitute: true })
      }
    }

  }
  onSubmit() {
    this.bnrcDetailForm.markAllAsTouched()
    console.log("this.bnrcDetailForm", this.bnrcDetailForm)
    this.loader.changeLoad.next(true)

    this.checkInstitute()
    if (this.bnrcDetailForm.valid) {

      const phone = {
        phone: this.bnrcDetailForm.value.phone
      }
      this.isSubmitting = true
      this.otpPage = true
      this.userProfileSvc.bnrcSendOtp(phone).subscribe((res: any) => {
        if (res.status === 'success') {
          this.otpPage = true
          this.openSnackbar(res.message)
        }
      },
        (error) => {
          this.isSubmitting = false
          this.loader.changeLoad.next(false)
          this.openSnackbar(error.error.message)
        })
    } else {
      if (this.bnrcDetailForm.errors && this.bnrcDetailForm.errors.required) {
        const missingFields: string[] = []
        Object.keys(this.bnrcDetailForm.controls).forEach(controlName => {
          const control = this.bnrcDetailForm.get(controlName)
          if (control && control.errors && control.errors.required) {
            missingFields.push(controlName)
          }
        })

        if (missingFields.length > 0) {
          const errorMessage = `The following fields are required: ${missingFields.join(', ')}.`
          this.openSnackbar(errorMessage)
        } else {
          this.openSnackbar('Some fields are required. Please check the form.')
        }
      }

    }
  }
  createUser(event: any) {
    console.log("event", event)
    const formValues = { ...this.bnrcDetailForm.value, phone: +this.bnrcDetailForm.value.phone }
    const reqUpdate = {
      request: {
        formValues
      },
    }
    this.userProfileSvc.bnrcRegistration(reqUpdate).subscribe(
      (res: any) => {
        this.isSubmitting = false
        console.log("test", res)
        if (res.status === 'SUCCESS') {
          this.loader.changeLoad.next(false)
          this.showMessage = true
          this.resetForm()
          this.dialog.open(BnrcmodalComponent, {
            width: '350px',
            height: '305px',
            panelClass: 'overview-modal',
            disableClose: true,
            data: {
              message: 'कृपया ई-क्षमता ऐप डाउनलोड करें और दिए गए मोबाइल नंबर के साथ ओटीपी का उपयोग करके लॉगिन करें । Kindly download the e- Kshamata app and login using your given mobile number with OTP.', from: 'Bnrc'
            },
          })
        } else {
          console.log('Form is valid. Saving data...', res)

          this.loader.changeLoad.next(false)
          this.openSnackbar(res.message)

        }
      },
      (error) => {
        this.isSubmitting = false
        console.error('HTTP Error:', error.error.message)

        this.loader.changeLoad.next(false)
        this.openSnackbar(error.error.message)

      }
    )
  }
  public openSnackbar(primaryMsg: string, duration: number = 10000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

}

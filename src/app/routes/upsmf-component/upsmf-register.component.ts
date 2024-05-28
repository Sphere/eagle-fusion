import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
// import { Router } from '@angular/router'
import { ConfigurationsService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '@ws-widget/collection'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
// import { constructReq } from '../request-util'
import { MatDialog, MatSnackBar } from '@angular/material'
import { NsUserProfileDetails } from '@ws/app/src/lib/routes/user-profile/models/NsUserProfile'
import * as _ from 'lodash'
import { HttpClient } from '@angular/common/http'
import { BnrcmodalComponent } from '../bnrc-popup/bnrc-modal-component'
import { LoaderService } from '../../../../project/ws/author/src/public-api'
@Component({
  selector: 'ws-upsmf-register',
  templateUrl: './upsmf-register.component.html',
  styleUrls: ['./upsmf-register.component.scss'],
})

export class UpsmfRegisterComponent implements OnInit {
  professions = ['Student', 'Faculty']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  inserviceList = ['Public Health Facility', 'Private Health Facility']
  facultyList = ['Diploma', 'Degree']
  courseSelection = ['ANM']
  districtUrl = '../../../fusion-assets/files/district.json'
  Position = ['ANM', 'Staff Nurse', 'Doctor']
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
  publicHealthFacility = false
  privateHealthFacility = false

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
    "Agra",
    "Aligarh",
    "Allahabad",
    "Ambedkar Nagar",
    "Amethi (Chatrapati Sahuji Mahraj Nagar)",
    "Amroha (J.P. Nagar)",
    "Auraiya",
    "Azamgarh",
    "Baghpat",
    "Bahraich",
    "Ballia",
    "Balrampur",
    "Banda",
    "Barabanki",
    "Bareilly",
    "Basti",
    "Bhadohi",
    "Bijnor",
    "Budaun",
    "Bulandshahr",
    "Chandauli",
    "Chitrakoot",
    "Deoria",
    "Etah",
    "Etawah",
    "Faizabad",
    "Farrukhabad",
    "Fatehpur",
    "Firozabad",
    "Gautam Buddha Nagar",
    "Ghaziabad",
    "Ghazipur",
    "Gonda",
    "Gorakhpur",
    "Hamirpur",
    "Hapur (Panchsheel Nagar)",
    "Hardoi",
    "Hathras",
    "Jalaun",
    "Jaunpur",
    "Jhansi",
    "Kannauj",
    "Kanpur Dehat",
    "Kanpur Nagar",
    "Kanshiram Nagar (Kasganj)",
    "Kaushambi",
    "Kushinagar (Padrauna)",
    "Lakhimpur - Kheri",
    "Lalitpur",
    "Lucknow",
    "Maharajganj",
    "Mahoba",
    "Mainpuri",
    "Mathura",
    "Mau",
    "Meerut",
    "Mirzapur",
    "Moradabad",
    "Muzaffarnagar",
    "Pilibhit",
    "Pratapgarh",
    "RaeBareli",
    "Rampur",
    "Saharanpur",
    "Sambhal (Bhim Nagar)",
    "Sant Kabir Nagar",
    "Shahjahanpur",
    "Shamali (Prabuddh Nagar)",
    "Shravasti",
    "Siddharth Nagar",
    "Sitapur",
    "Sonbhadra",
    "Sultanpur",
    "Unnao",
    "Varanasi"
  ]
  isSubmitting = false;

  message: string = ''
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

  ) {
    this.bnrcDetailForm = this.formBuilder.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
      email: new FormControl('', [Validators.pattern(/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      role: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)]),
      district: new FormControl('', [Validators.required]),
      instituteName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      courseSelection: new FormControl('', []),
      instituteType: new FormControl('', []),
      upsmfRegistrationNumber: new FormControl('', []),
      hrmsId: new FormControl('', []),
      facultyType: new FormControl('', []),
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
      instituteName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      courseSelection: new FormControl('', []),
      instituteType: new FormControl('', []),
      upsmfRegistrationNumber: new FormControl('', []),
      hrmsId: new FormControl('', []),
      facultyType: new FormControl('', []),
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

  serviceTypeChange(value: string) {
    console.log("regulating service type", value)
    const hrmsIdControl = this.bnrcDetailForm.get('hrmsId')
    const bnrcRegistrationNumberControl = this.bnrcDetailForm.get('upsmfRegistrationNumber')

    if (hrmsIdControl && bnrcRegistrationNumberControl) {
      if (value === 'Regular') {
        this.hrmsErr = true
        this.bnrcErr = false
        hrmsIdControl.setValidators([Validators.required])
        bnrcRegistrationNumberControl.clearValidators()
      } else {
        this.hrmsErr = false
        this.bnrcErr = true
        hrmsIdControl.clearValidators()
        bnrcRegistrationNumberControl.setValidators([Validators.required])
      }

      hrmsIdControl.updateValueAndValidity()
      bnrcRegistrationNumberControl.updateValueAndValidity()
    }
  }
  professionalChange(value: any) {
    this.showMessage = false
    console.log("degree", value, this.userProfileData)
    if (value === 'Student') {
      this.showDesignation = true


      this.Student = true
      this.Faculty = false
      this.inService = false
      this.publicHealthFacility = false
      this.privateHealthFacility = false
      const instituteNameControl = this.bnrcDetailForm.get('instituteName')
      if (instituteNameControl) {
        instituteNameControl.setValidators([Validators.required])
        instituteNameControl.updateValueAndValidity()

      }
      const instituteTypeControl = this.bnrcDetailForm.get('instituteType')
      if (instituteTypeControl) {
        instituteTypeControl.setValidators([Validators.required])
        instituteTypeControl.updateValueAndValidity()

      }
      const courseSelectionControl = this.bnrcDetailForm.get('courseSelection')
      if (courseSelectionControl) {
        courseSelectionControl.setValidators([Validators.required])
        courseSelectionControl.updateValueAndValidity()

      }
      this.bnrcDetailForm.controls.facultyType.setValue(null)
      this.bnrcDetailForm.controls.upsmfRegistrationNumber.setValue(null)


      this.bnrcDetailForm.controls.hrmsId.setValue(null)



      const facilityNameControl = this.bnrcDetailForm.get('facilityName')
      if (facilityNameControl) {
        facilityNameControl.clearValidators()
        facilityNameControl.updateValueAndValidity()

      }
      const bnrcRegistrationNumberControl = this.bnrcDetailForm.get('upsmfRegistrationNumber')
      if (bnrcRegistrationNumberControl) {
        bnrcRegistrationNumberControl.clearValidators()
        bnrcRegistrationNumberControl.updateValueAndValidity()

      }
      const hrmsIdControl = this.bnrcDetailForm.get('hrmsId')
      if (hrmsIdControl) {
        hrmsIdControl.clearValidators()
        hrmsIdControl.updateValueAndValidity()
      }
    } else if (value === 'Faculty') {
      this.showDesignation = true
      this.hrmsErr = false
      this.bnrcErr = true
      this.Student = false
      this.Faculty = true
      this.inService = false
      this.publicHealthFacility = false
      this.privateHealthFacility = false
      const instituteNameControl = this.bnrcDetailForm.get('instituteName')
      if (instituteNameControl) {
        instituteNameControl.setValidators([Validators.required])
        instituteNameControl.updateValueAndValidity()

      }
      const instituteTypeControl = this.bnrcDetailForm.get('instituteType')
      if (instituteTypeControl) {
        instituteTypeControl.setValidators([Validators.required])
        instituteTypeControl.updateValueAndValidity()

      }
      const facultyTypeControl = this.bnrcDetailForm.get('facultyType')
      if (facultyTypeControl) {
        facultyTypeControl.setValidators([Validators.required])
        facultyTypeControl.updateValueAndValidity()

      }
      const bnrcRegistrationNumberControl = this.bnrcDetailForm.get('upsmfRegistrationNumber')
      if (bnrcRegistrationNumberControl) {
        bnrcRegistrationNumberControl.setValidators([Validators.required])
        bnrcRegistrationNumberControl.updateValueAndValidity()

      }
      const hrmsIdControl = this.bnrcDetailForm.get('hrmsId')
      if (hrmsIdControl) {
        hrmsIdControl.clearValidators()
        hrmsIdControl.updateValueAndValidity()
      }
      const courseSelectionControl = this.bnrcDetailForm.get('courseSelection')
      if (courseSelectionControl) {
        courseSelectionControl.clearValidators()
        courseSelectionControl.updateValueAndValidity()

      }
      const publicFacilityTypeControl = this.bnrcDetailForm.get('publicFacilityType')
      if (publicFacilityTypeControl) {
        publicFacilityTypeControl.clearValidators()
        publicFacilityTypeControl.updateValueAndValidity()

      }
      const roleForInServiceControl = this.bnrcDetailForm.get('roleForInService')
      if (roleForInServiceControl) {
        roleForInServiceControl.clearValidators()
        roleForInServiceControl.updateValueAndValidity()

      }
      const serviceTypeControl = this.bnrcDetailForm.get('serviceType')
      if (serviceTypeControl) {
        serviceTypeControl.clearValidators()
        serviceTypeControl.updateValueAndValidity()

      }
      const facilityNameControl = this.bnrcDetailForm.get('facilityName')
      if (facilityNameControl) {
        facilityNameControl.clearValidators()
        facilityNameControl.updateValueAndValidity()

      }


      this.bnrcDetailForm.controls.hrmsId.setValue(null)
      this.bnrcDetailForm.controls.courseSelection.setValue(null)


    } else if (value === 'In Service') {
      this.showDesignation = true

      this.bnrcDetailForm.controls.courseSelection.setValue(null)

      this.Student = false
      this.Faculty = false
      this.inService = true
      this.publicHealthFacility = false
      this.privateHealthFacility = false

    } else if (value === 'Public Health Facility') {
      this.showDesignation = true
      this.Student = false
      this.Faculty = false
      this.inService = false
      this.publicHealthFacility = true
      this.privateHealthFacility = false
      const courseSelectionControl = this.bnrcDetailForm.get('courseSelection')
      if (courseSelectionControl) {
        courseSelectionControl.clearValidators()
        courseSelectionControl.updateValueAndValidity()

      }

      const instituteTypeControl = this.bnrcDetailForm.get('instituteType')
      if (instituteTypeControl) {
        instituteTypeControl.clearValidators() // Clear existing validators
        instituteTypeControl.updateValueAndValidity() // Update the form control
      }

      const instituteNameControl = this.bnrcDetailForm.get('instituteName')
      if (instituteNameControl) {
        console.log("test", instituteTypeControl)
        instituteNameControl.clearValidators()
        instituteNameControl.updateValueAndValidity() // Update the form control

      }

      const publicFacilityTypeControl = this.bnrcDetailForm.get('publicFacilityType')
      if (publicFacilityTypeControl) {
        publicFacilityTypeControl.setValidators([Validators.required])
        publicFacilityTypeControl.updateValueAndValidity()

      }
      const facultyTypeControl = this.bnrcDetailForm.get('facultyType')
      if (facultyTypeControl) {
        facultyTypeControl.clearValidators()
        facultyTypeControl.updateValueAndValidity() // Update the form control
      }
      const roleForInServiceControl = this.bnrcDetailForm.get('roleForInService')
      if (roleForInServiceControl) {
        roleForInServiceControl.setValidators([Validators.required])
        roleForInServiceControl.updateValueAndValidity()

      }

      const serviceTypeControl = this.bnrcDetailForm.get('serviceType')
      if (serviceTypeControl) {
        serviceTypeControl.setValidators([Validators.required])
        serviceTypeControl.updateValueAndValidity()

      }
      const facilityNameControl = this.bnrcDetailForm.get('facilityName')
      if (facilityNameControl) {
        facilityNameControl.setValidators([Validators.required])
        facilityNameControl.updateValueAndValidity()

      }
      const privateFacilityTypeControl = this.bnrcDetailForm.get('privateFacilityType')
      if (privateFacilityTypeControl) {
        privateFacilityTypeControl.clearValidators()
        privateFacilityTypeControl.updateValueAndValidity()

      }
      this.bnrcDetailForm.controls.facultyType.setValue(null)

    } else if (value === 'Private Health Facility') {
      this.showDesignation = true
      this.Student = false
      this.Faculty = false
      this.inService = false
      this.publicHealthFacility = false
      this.privateHealthFacility = true
      const courseSelectionControl = this.bnrcDetailForm.get('courseSelection')
      if (courseSelectionControl) {
        courseSelectionControl.clearValidators()
        courseSelectionControl.updateValueAndValidity()

      }
      const facultyTypeControl = this.bnrcDetailForm.get('facultyType')
      if (facultyTypeControl) {
        facultyTypeControl.clearValidators()
        facultyTypeControl.updateValueAndValidity()

      }
      const privateFacilityTypeControl = this.bnrcDetailForm.get('privateFacilityType')
      if (privateFacilityTypeControl) {
        privateFacilityTypeControl.setValidators([Validators.required])
        privateFacilityTypeControl.updateValueAndValidity()

      }
      const facilityNameControl = this.bnrcDetailForm.get('facilityName')
      if (facilityNameControl) {
        facilityNameControl.setValidators([Validators.required])
        facilityNameControl.updateValueAndValidity()

      }
      const bnrcRegistrationNumberControl = this.bnrcDetailForm.get('upsmfRegistrationNumber')
      if (bnrcRegistrationNumberControl) {
        bnrcRegistrationNumberControl.setValidators([Validators.required])
        bnrcRegistrationNumberControl.updateValueAndValidity()

      }
      const serviceTypeControl = this.bnrcDetailForm.get('serviceType')
      if (serviceTypeControl) {
        serviceTypeControl.clearValidators()
        serviceTypeControl.updateValueAndValidity()

      }
      this.bnrcDetailForm.controls.facultyType.setValue(null)
      this.bnrcDetailForm.controls.hrmsId.setValue(null)

      this.bnrcDetailForm.controls.serviceType.setValue(null)
      this.bnrcDetailForm.controls.instituteName.setValue(null)
      this.bnrcDetailForm.controls.instituteType.setValue(null)
      this.bnrcDetailForm.controls.courseSelection.setValue(null)
    } else {
      this.showDesignation = true


      this.Student = false
      this.Faculty = false
      this.inService = false
      this.publicHealthFacility = false
      this.privateHealthFacility = false
    }
    this.bnrcDetailForm.updateValueAndValidity()

  }

  onSubmit() {
    this.bnrcDetailForm.markAllAsTouched()
    this.loader.changeLoad.next(true)
    console.log("this.bnrcDetailForm.valid", this.bnrcDetailForm)
    if (this.bnrcDetailForm.valid) {
      const formValues = { ...this.bnrcDetailForm.value, phone: +this.bnrcDetailForm.value.phone }
      const reqUpdate = {
        request: {
          formValues
        },
      }
      this.isSubmitting = true




      this.userProfileSvc.upsmfRegistration(reqUpdate).subscribe(
        (res: any) => {
          this.isSubmitting = false
          console.log("test", res)
          if (res.status === 'SUCCESS') {
            this.loader.changeLoad.next(false)
            this.showMessage = true
            this.resetForm()
            this.dialog.open(BnrcmodalComponent, {
              width: '350px',
              height: '300px',
              panelClass: 'overview-modal',
              disableClose: true,
              data: { from: "Upsmf", message: 'Kindly download the e-Kshamata app and login using your given mobile number with OTP.' },
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

  public openSnackbar(primaryMsg: string, duration: number = 10000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

}

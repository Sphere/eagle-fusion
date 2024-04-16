import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
// import { Router } from '@angular/router'
import { ConfigurationsService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '@ws-widget/collection'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
// import { constructReq } from '../request-util'
import { MatSnackBar } from '@angular/material'
import { NsUserProfileDetails } from '@ws/app/src/lib/routes/user-profile/models/NsUserProfile'
import * as _ from 'lodash'
import { HttpClient } from '@angular/common/http'
@Component({
  selector: 'ws-bnrc-register',
  templateUrl: './bnrc-register.component.html',
  styleUrls: ['./bnrc-register.component.scss'],
})

export class BnrcRegisterComponent implements OnInit {
  professions = ['Student', 'Faculty', 'In Service']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  inserviceList = ['Public Health Facility', 'Private Health Facility']
  facultyList = ['Diploma', 'Degree']
  courseSelection = ['ANM', 'GNM', 'BSc Nursing', 'PBBSc Nursing', 'MSc Nursing']
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

  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  hrmsErr: boolean = false
  bnrcErr: boolean = false
  constructor(
    public configSvc: ConfigurationsService,
    public userProfileSvc: UserProfileService,
    // private router: Router,
    public valueSvc: ValueService,
    public contentSvc: WidgetContentService,
    public UserAgentResolverService: UserAgentResolverService,
    public snackBar: MatSnackBar,
    public http: HttpClient,
    private formBuilder: FormBuilder
  ) {
    this.bnrcDetailForm = this.formBuilder.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]*$/)]),
      email: new FormControl('', [Validators.pattern(/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      role: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)]),
      district: new FormControl('', [Validators.required]),
      instituteName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
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
    const bnrcRegistrationNumberControl = this.bnrcDetailForm.get('bnrcRegistrationNumber')

    if (hrmsIdControl && bnrcRegistrationNumberControl) {
      if (value === 'Regular') {
        this.hrmsErr = true
        this.bnrcErr = false
        hrmsIdControl.setValidators([Validators.required])
        bnrcRegistrationNumberControl.setValidators([])
      } else {
        this.hrmsErr = false
        this.bnrcErr = true
        hrmsIdControl.setValidators([])
        bnrcRegistrationNumberControl.setValidators([Validators.required])
      }

      hrmsIdControl.updateValueAndValidity()
      bnrcRegistrationNumberControl.updateValueAndValidity()
    }
  }
  professionalChange(value: any) {
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
      }
      const instituteTypeControl = this.bnrcDetailForm.get('instituteType')
      if (instituteTypeControl) {
        instituteTypeControl.setValidators([Validators.required])
      }
      const courseSelectionControl = this.bnrcDetailForm.get('courseSelection')
      if (courseSelectionControl) {
        courseSelectionControl.setValidators([Validators.required])
      }
    } else if (value === 'Faculty') {
      this.showDesignation = true


      this.Student = false
      this.Faculty = true
      this.inService = false
      this.publicHealthFacility = false
      this.privateHealthFacility = false
      const instituteNameControl = this.bnrcDetailForm.get('instituteName')
      if (instituteNameControl) {
        instituteNameControl.setValidators([Validators.required])
      }
      const instituteTypeControl = this.bnrcDetailForm.get('instituteType')
      if (instituteTypeControl) {
        instituteTypeControl.setValidators([Validators.required])
      }
      const facultyTypeControl = this.bnrcDetailForm.get('facultyType')
      if (facultyTypeControl) {
        facultyTypeControl.setValidators([Validators.required])
      }
      const bnrcRegistrationNumberControl = this.bnrcDetailForm.get('bnrcRegistrationNumber')
      if (bnrcRegistrationNumberControl) {
        bnrcRegistrationNumberControl.setValidators([Validators.required])
      }
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

      const publicFacilityTypeControl = this.bnrcDetailForm.get('publicFacilityType')
      if (publicFacilityTypeControl) {
        publicFacilityTypeControl.setValidators([Validators.required])
      }

      const roleForInServiceControl = this.bnrcDetailForm.get('roleForInService')
      if (roleForInServiceControl) {
        roleForInServiceControl.setValidators([Validators.required])
      }

      const serviceTypeControl = this.bnrcDetailForm.get('serviceType')
      if (serviceTypeControl) {
        serviceTypeControl.setValidators([Validators.required])
      }
      const facilityNameControl = this.bnrcDetailForm.get('facilityName')
      if (facilityNameControl) {
        facilityNameControl.setValidators([Validators.required])
      }


    } else if (value === 'Private Health Facility') {
      this.showDesignation = true


      this.Student = false
      this.Faculty = false
      this.inService = false
      this.publicHealthFacility = false
      this.privateHealthFacility = true

      const privateFacilityTypeControl = this.bnrcDetailForm.get('privateFacilityType')
      if (privateFacilityTypeControl) {
        privateFacilityTypeControl.setValidators([Validators.required])
      }
      const facilityNameControl = this.bnrcDetailForm.get('facilityName')
      if (facilityNameControl) {
        facilityNameControl.setValidators([Validators.required])
      }
      const bnrcRegistrationNumberControl = this.bnrcDetailForm.get('bnrcRegistrationNumber')
      if (bnrcRegistrationNumberControl) {
        bnrcRegistrationNumberControl.setValidators([Validators.required])
      }
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
    // Trigger form validation
    this.bnrcDetailForm.markAllAsTouched()
    console.log("error", this.bnrcDetailForm.errors)
    // Check if the form is valid

    if (this.bnrcDetailForm.valid) {
      const formValues = this.bnrcDetailForm.value
      const reqUpdate = {
        request: {
          formValues

        },
      }

      console.log("role", reqUpdate)
      this.userProfileSvc.bnrcRegistration(reqUpdate).subscribe(
        (res: any) => {
          if (res) {
            this.openSnackbar('User registration successfull')
          }
        })
      console.log('Form is valid. Saving data...')
    } else {
      //   // Form is invalid, display validation errors
      console.log('Form is invalid. Please check the fields.')
    }
  }

  public openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

}

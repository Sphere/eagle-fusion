import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
// import { Router } from '@angular/router'
import { ConfigurationsService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '@ws-widget/collection'
import { FormControl, FormGroup, Validators } from '@angular/forms'
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
  professions = ['Student', 'Faculty', 'In Service', 'Public Health Facility', 'Private Health Facility']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  healthVolunteerProfessions = ['Anganwadi Workers', 'Mukhya Sevika (MS)', 'Child Development Project Officer (CDPO)', 'District Programme Officer (DPO)', 'BSC Nurse', 'Others']
  healthWorkerProfessions = ['Midwives', 'GNM', 'Doctors', 'Public Health Professionals', 'Paramedical', 'Pharmacist', 'Community Health Officer (CHO)', 'BSC Nurse', 'ANM/MPW', 'Others']
  inserviceList = ['Public Health Facility', 'Private Health Facility']
  facultyList = ['Diploma', 'Degree']
  courseSelection = ['ANM', 'GNM', 'BSc Nursing', 'PBBSc Nursing', 'MSc Nursing']
  districtUrl = '../../../fusion-assets/files/district.json'
  Position = ['ANM', 'Staff Nurse', 'Doctor']
  instituteType = ['Government', 'Private']

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
  constructor(
    public configSvc: ConfigurationsService,
    public userProfileSvc: UserProfileService,
    // private router: Router,
    public valueSvc: ValueService,
    public contentSvc: WidgetContentService,
    public UserAgentResolverService: UserAgentResolverService,
    public snackBar: MatSnackBar,
    public http: HttpClient,
  ) {
    this.bnrcDetailForm = new FormGroup({
      firstname: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      profession: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      designation: new FormControl('', [Validators.required]),
      professionOtherSpecify: new FormControl('', [Validators.required]),
      regNurseRegMidwifeNumber: new FormControl('', [Validators.pattern(/[^\s]/)]),
      orgType: new FormControl('', [Validators.required]),
      orgOtherSpecify: new FormControl('', [Validators.required]),
      organizationName: new FormControl('', [Validators.required]),
      block: new FormControl('', [Validators.required]),
      subcentre: new FormControl('', [Validators.required]),
      professSelected: new FormControl('', [Validators.required]),
      orgName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      instituteName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      courseName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      locationselect: new FormControl('', [Validators.required]),
      selectBackground: new FormControl('', [Validators.required]),
      nameOther: new FormControl('', [Validators.required]),
      district: new FormControl('', [Validators.required]),
      division: new FormControl('', [Validators.required]),
      courseSelection: new FormControl('', [Validators.required]),
      instituteType: new FormControl('', [Validators.required]),
      bnrcNumber: new FormControl('', [Validators.required]),
      hrmsId: new FormControl('', [Validators.required]),
      facultyList: new FormControl('', [Validators.required]),
      facilityName: new FormControl('', [Validators.required]),
      position: new FormControl('', [Validators.required]),
    })
  }
  englishWordValidator(control: FormControl) {
    const englishRegex = /^[a-zA-Z\s]*$/ // Regex pattern to match English letters and spaces

    if (!englishRegex.test(control.value)) {
      return { notEnglish: true }
    }

    return null
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



  professionalChange(value: any) {
    console.log("degree", value, this.userProfileData)
    if (value === 'Student') {
      this.showDesignation = true


      this.Student = true
      this.Faculty = false
      this.inService = false
      this.publicHealthFacility = false
      this.privateHealthFacility = false

    } else if (value === 'Faculty') {
      this.showDesignation = true


      this.Student = false
      this.Faculty = true
      this.inService = false
      this.publicHealthFacility = false
      this.privateHealthFacility = false

    } else if (value === 'In Service') {
      this.showDesignation = true


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
    } else if (value === 'Private Health Facility') {
      this.showDesignation = true


      this.Student = false
      this.Faculty = false
      this.inService = false
      this.publicHealthFacility = false
      this.privateHealthFacility = true

    } else {
      this.showDesignation = true


      this.Student = false
      this.Faculty = false
      this.inService = false
      this.publicHealthFacility = false
      this.privateHealthFacility = false
    }

  }

  onSubmit(form: any) {
    const reqUpdate = {
      request: {
        form
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
        }
      })
  }

  public openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

}

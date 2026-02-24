import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { HttpClient } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'

import { ConfigurationsService, LoggerService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { LoaderService } from '../../../../project/ws/author/src/public-api'
import { BnrcmodalComponent } from '../bnrc-popup/bnrc-modal-component'

@Component({
  selector: 'ws-upsmf-register',
  templateUrl: './upsmf-register.component.html',
  styleUrls: ['./upsmf-register.component.scss'],
})
export class UpsmfRegisterComponent implements OnInit {
  // Form groups
  anmRegistrationForm: FormGroup
  preServiceForm: FormGroup
  medicalOfficerForm: FormGroup

  // Service type flags
  isInService = false
  isPreService = false
  isMedicalOfficerUP = false

  // Role flags for pre-service
  isStudent = false
  isFaculty = false

  // Employment type flags for in-service
  isGovernmentEmployee = false
  isPrivateEmployee = false
  isEkshamata = true // Flag for DOB component

  // Form submission flags
  isSubmitting = false
  otpPage = false
  showbackButton = false

  // Dropdown data
  districts: string[] = []
  blocks: string[] = []
  facilityTypes: string[] = []
  availableFacilities: any[] = []

  // Pre-service specific options
  professions = ['Student', 'Faculty']
  instituteTypes = ['Government Medical College', 'Private Medical College', 'Nursing School', 'ANM Training Institute', 'Government Nursing College', 'Private Nursing College']
  courseSelection = ['ANM Course', 'GNM Course', 'B.Sc Nursing', 'Post Basic B.Sc Nursing', 'M.Sc Nursing']
  facultyTypes = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Clinical Instructor', 'Principal', 'Vice Principal']

  // Data URLs
  biharDistrictUrl = `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/up_District.json?cb=${Date.now()}`
  biharDistrictData: any = {}

  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>

  constructor(
    public configSvc: ConfigurationsService,
    public valueSvc: ValueService,
    public userProfileSvc: UserProfileService,
    public snackBar: MatSnackBar,
    public http: HttpClient,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private loader: LoaderService,
    private route: ActivatedRoute,
    private logger: LoggerService
  ) {
    this.anmRegistrationForm = this.createInServiceFormGroup()
    this.preServiceForm = this.createPreServiceFormGroup()
    this.medicalOfficerForm = this.createMedicalOfficerFormGroup()
  }

  ngOnInit(): void {
    // Check query parameter to determine service type
    this.route.queryParams.subscribe(params => {
      const service = params['service']
      if (service === 'inservice') {
        this.isInService = true
        this.isPreService = false
        this.isMedicalOfficerUP = false
      } else if (service === 'preservice') {
        this.isPreService = true
        this.isInService = false
        this.isMedicalOfficerUP = false
      } else if (service === 'medicalofficerup') {
        this.isMedicalOfficerUP = true
        this.isInService = false
        this.isPreService = false
      } else {
        // Default to in-service if no valid parameter
        this.isInService = true
        this.isPreService = false
        this.isMedicalOfficerUP = false
      }
    })

    this.loadDistrictData()
    this.setupFormSubscriptions()
    this.setupResponsiveLayout()
  }

  private createInServiceFormGroup(): FormGroup {
    return this.formBuilder.group({
      firstName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)
      ]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]),
      dob: new FormControl('', [Validators.required]),
      regNurseRegMidwifeNumber: new FormControl('', [Validators.required]),
      roleForInService: new FormControl('', [Validators.required]),
      role: new FormControl(''),
      serviceType: new FormControl(''),
      hrmsId: new FormControl(''),
      district: new FormControl(''),
      block: new FormControl(''),
      facilityType: new FormControl(''),
      facilityName: new FormControl(''),
      facilityCode: new FormControl('')  // Removed as per new requirements
    })
  }

  private createPreServiceFormGroup(): FormGroup {
    return this.formBuilder.group({
      firstName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)
      ]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]),
      district: new FormControl('', [Validators.required]),
      role: new FormControl('', [Validators.required]),
      instituteName: new FormControl(''),
      instituteType: new FormControl(''),
      courseSelection: new FormControl(''),
      facultyType: new FormControl(''),
      hrmsId: new FormControl(''),
      upsmfRegistrationNumber: new FormControl('')
    })
  }

  private createMedicalOfficerFormGroup(): FormGroup {
    return this.formBuilder.group({
      hrmsId: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)
      ]),
      role: new FormControl('', []),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
      district: new FormControl('', [Validators.required]),
      dob: new FormControl('', [Validators.required]),
      dateOfJoining: new FormControl('', [Validators.required]),
      seniorityNumber: new FormControl('', [])
    })
  }

  private loadDistrictData(): void {
    this.logger.log("called")
    this.http.get(this.biharDistrictUrl).subscribe((districtData: any) => {
      this.logger.log("districtData", districtData.length > 0)
      if (Array.isArray(districtData) && districtData.length > 0) {
        this.biharDistrictData = districtData[0]
        this.districts = Object.keys(this.biharDistrictData)
      }
    })
  }

  private setupFormSubscriptions(): void {
    // District change for government employees (in-service only)
    this.anmRegistrationForm.get('district')?.valueChanges.subscribe(selectedDistrict => {
      this.onDistrictChange(selectedDistrict)
    })

    // Block change for government employees (in-service only)
    this.anmRegistrationForm.get('block')?.valueChanges.subscribe(selectedBlock => {
      this.onBlockChange(selectedBlock)
    })

    // Facility type change (in-service only)
    this.anmRegistrationForm.get('facilityType')?.valueChanges.subscribe(facilityType => {
      this.onFacilityTypeChange(facilityType)
    })
  }

  private setupResponsiveLayout(): void {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.showbackButton = isXSmall
    })
  }

  // Pre-service role selection handler
  onRoleChange(selectedRole: string): void {
    this.isStudent = selectedRole === 'Student'
    this.isFaculty = selectedRole === 'Faculty'

    // Update validators based on role
    this.updatePreServiceValidators()
  }

  private updatePreServiceValidators(): void {
    const instituteNameControl = this.preServiceForm.get('instituteName')
    const instituteTypeControl = this.preServiceForm.get('instituteType')
    const courseSelectionControl = this.preServiceForm.get('courseSelection')
    const facultyTypeControl = this.preServiceForm.get('facultyType')
    const hrmsIdControl = this.preServiceForm.get('hrmsId')
    const upsmfRegistrationControl = this.preServiceForm.get('upsmfRegistrationNumber')

      // Clear existing validators
      ;[instituteNameControl, instituteTypeControl, courseSelectionControl,
        facultyTypeControl, hrmsIdControl, upsmfRegistrationControl].forEach(control => {
          control?.clearValidators()
          control?.setValue('')
          control?.updateValueAndValidity()
        })

    if (this.isStudent) {
      // Student-specific required fields
      instituteNameControl?.setValidators([Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)])
      instituteTypeControl?.setValidators([Validators.required])
      courseSelectionControl?.setValidators([Validators.required])
    } else if (this.isFaculty) {
      // Faculty-specific required fields
      instituteNameControl?.setValidators([Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)])
      instituteTypeControl?.setValidators([Validators.required])
      facultyTypeControl?.setValidators([Validators.required])
      hrmsIdControl?.setValidators([Validators.required])
      upsmfRegistrationControl?.setValidators([Validators.required])
    }

    // Update validity
    ;[instituteNameControl, instituteTypeControl, courseSelectionControl,
      facultyTypeControl, hrmsIdControl, upsmfRegistrationControl].forEach(control => {
        control?.updateValueAndValidity()
      })
  }

  onEmploymentTypeChange(roleForInService: string): void {
    this.resetFormValidation()

    if (roleForInService === 'Government') {
      this.isGovernmentEmployee = true
      this.isPrivateEmployee = false
      this.setGovernmentValidators()
    } else if (roleForInService === 'Private') {
      this.isGovernmentEmployee = false
      this.isPrivateEmployee = true
      this.setPrivateValidators()
      this.anmRegistrationForm.get('serviceType')?.setValue('Private')
    }
  }

  onDobChange(dobValue: string): void {
    if (this.isInService) {
      this.anmRegistrationForm.get('dob')?.setValue(dobValue)
      this.anmRegistrationForm.get('dob')?.updateValueAndValidity()
    } else if (this.isPreService) {
      this.preServiceForm.get('dob')?.setValue(dobValue)
      this.preServiceForm.get('dob')?.updateValueAndValidity()
    }
  }

  onMedicalOfficerDobChange(dobValue: string): void {
    this.medicalOfficerForm.get('dob')?.setValue(dobValue)
    this.medicalOfficerForm.get('dob')?.updateValueAndValidity()
  }

  onDateOfJoiningChange(dateValue: string): void {
    this.medicalOfficerForm.get('dateOfJoining')?.setValue(dateValue)
    this.medicalOfficerForm.get('dateOfJoining')?.updateValueAndValidity()
  }

  onDistrictChange(selectedDistrict: string): void {
    if (selectedDistrict && this.biharDistrictData[selectedDistrict]) {
      this.blocks = Object.keys(this.biharDistrictData[selectedDistrict])
    } else {
      this.blocks = []
    }

    // Reset dependent fields
    this.facilityTypes = []
    this.availableFacilities = []
    this.anmRegistrationForm.get('block')?.reset()
    this.anmRegistrationForm.get('facilityType')?.reset()
    this.anmRegistrationForm.get('facilityName')?.reset()
  }

  onBlockChange(selectedBlock: string): void {
    const selectedDistrict = this.anmRegistrationForm.get('district')?.value

    if (selectedDistrict && selectedBlock && this.biharDistrictData[selectedDistrict][selectedBlock]) {
      this.facilityTypes = Object.keys(this.biharDistrictData[selectedDistrict][selectedBlock])
    } else {
      this.facilityTypes = []
    }

    // Reset dependent fields
    this.availableFacilities = []
    this.anmRegistrationForm.get('facilityType')?.reset()
    this.anmRegistrationForm.get('facilityName')?.reset()
  }

  onFacilityTypeChange(selectedFacilityType: string): void {
    const selectedDistrict = this.anmRegistrationForm.get('district')?.value
    const selectedBlock = this.anmRegistrationForm.get('block')?.value

    if (selectedDistrict && selectedBlock && selectedFacilityType &&
      this.biharDistrictData[selectedDistrict][selectedBlock][selectedFacilityType]) {
      this.availableFacilities = this.biharDistrictData[selectedDistrict][selectedBlock][selectedFacilityType]
    } else {
      this.availableFacilities = []
    }

    // Reset facility selection
    this.anmRegistrationForm.get('facilityName')?.reset()
  }

  // onFacilityNameChange(selectedFacility: any): void {
  //   this.logger.log('Selected facility:', selectedFacility)

  //   // Set facility code based on selected facility
  //   if (selectedFacility && selectedFacility.code) {
  //     this.anmRegistrationForm.get('facilityCode')?.setValue(selectedFacility.code)
  //   }

  //   this.logger.log('Facility code set to:', this.anmRegistrationForm.get('facilityCode')?.value)
  // }

  private resetFormValidation(): void {
    const governmentFields = ['serviceType', 'hrmsId', 'district', 'block', 'facilityType', 'facilityName']
    const privateFields = ['district', 'facilityName']

      ;[...governmentFields, ...privateFields].forEach(fieldName => {
        const control = this.anmRegistrationForm.get(fieldName)
        if (control) {
          control.clearValidators()
          control.setValue('')
          control.updateValueAndValidity()
        }
      })
  }

  private setGovernmentValidators(): void {
    this.anmRegistrationForm.controls['role'].setValue('ANM-UP')
    this.anmRegistrationForm.get('serviceType')?.setValidators([Validators.required])
    this.anmRegistrationForm.get('hrmsId')?.setValidators([
      Validators.required,
      Validators.pattern(/^[0-9]{5,8}$/)  // only numbers, 5–8 digits
    ])

    this.anmRegistrationForm.get('district')?.setValidators([Validators.required])
    this.anmRegistrationForm.get('block')?.setValidators([Validators.required])
    this.anmRegistrationForm.get('facilityType')?.setValidators([Validators.required])
    this.anmRegistrationForm.get('facilityName')?.setValidators([Validators.required])

    this.updateFormValidation(['serviceType', 'hrmsId', 'district', 'block', 'facilityType', 'facilityName'])
  }

  private setPrivateValidators(): void {
    this.anmRegistrationForm.controls['role'].setValue('ANM-UP')
    this.anmRegistrationForm.get('district')?.setValidators([Validators.required])
    this.anmRegistrationForm.get('facilityName')?.setValidators([
      Validators.required,
      Validators.pattern(/^[A-Za-z, ]+$/)
    ])

    this.updateFormValidation(['district', 'facilityName'])
  }

  private updateFormValidation(fields: string[]): void {
    fields.forEach(fieldName => {
      this.anmRegistrationForm.get(fieldName)?.updateValueAndValidity()
    })
  }

  // Form submission handlers
  onSubmit(): void {
    if (this.isInService) {
      this.onSubmitInService()
    } else if (this.isPreService) {
      this.onSubmitPreService()
    }
  }

  onSubmitInService(): void {
    this.anmRegistrationForm.markAllAsTouched()

    if (this.anmRegistrationForm.valid) {

      this.loader.changeLoad.next(true)
      this.isSubmitting = true

      const phone = { phone: this.anmRegistrationForm.value.phone }

      this.userProfileSvc.upsmfSendOtp(phone).subscribe(
        (res: any) => {
          if (res.status === 'success') {
            this.otpPage = true
            this.openSnackbar(res.message)
          }
        },
        (error) => {
          this.isSubmitting = false
          this.loader.changeLoad.next(false)
          this.openSnackbar(error.error.message)
        }
      )
    } else {
      this.handleFormErrors(this.anmRegistrationForm)
    }
  }

  onSubmitPreService(): void {
    this.preServiceForm.markAllAsTouched()

    if (this.preServiceForm.valid) {
      this.loader.changeLoad.next(true)
      this.isSubmitting = true

      const phone = { phone: this.preServiceForm.value.phone }

      this.userProfileSvc.upsmfSendOtp(phone).subscribe(
        (res: any) => {
          if (res.status === 'success') {
            this.otpPage = true
            this.openSnackbar(res.message)
          }
        },
        (error) => {
          this.isSubmitting = false
          this.loader.changeLoad.next(false)
          this.openSnackbar(error.error.message)
        }
      )
    } else {
      this.handleFormErrors(this.preServiceForm)
    }
  }

  onSubmitMedicalOfficer(): void {
    this.medicalOfficerForm.markAllAsTouched()

    if (this.medicalOfficerForm.valid) {
      this.loader.changeLoad.next(true)
      this.isSubmitting = true

      const phone = { phone: this.medicalOfficerForm.value.phone }
      this.userProfileSvc.upsmfSendOtp(phone).subscribe(
        (res: any) => {
          if (res.status === 'success') {
            this.otpPage = true
            this.openSnackbar(res.message)
          }
        },
        (error) => {
          this.isSubmitting = false
          this.loader.changeLoad.next(false)
          this.openSnackbar(error.error.message)
        }
      )
    } else {
      this.handleFormErrors(this.preServiceForm)
    }
  }

  private handleFormErrors(formGroup: FormGroup): void {
    const missingFields: string[] = []

    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName)
      if (control && control.errors && control.errors['required']) {
        missingFields.push(this.getFieldDisplayName(controlName))
      }
    })

    // Optional: Uncomment to show missing fields message
    // if (missingFields.length > 0) {
    //   const errorMessage = `The following fields are required: ${missingFields.join(', ')}.`
    //   this.openSnackbar(errorMessage)
    // } else {
    //   this.openSnackbar('Please check the form for validation errors.')
    // }
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      dob: 'Date of Birth',
      regNurseRegMidwifeNumber: 'Nursing Registration Number',
      roleForInService: 'Employment Type',
      serviceType: 'Type of Service',
      hrmsId: 'eHRMS Number',
      district: 'District',
      block: 'Block',
      facilityType: 'Facility Type',
      facilityName: 'Facility Name',
      role: 'Role',
      instituteName: 'Name of Institute',
      instituteType: 'Type of Institute',
      courseSelection: 'Course Selection',
      facultyType: 'Type of Faculty',
      upsmfRegistrationNumber: 'UPSMF Registration Number',
      dateOfJoining: 'Date of Joining',
      seniorityNumber: 'Seniority Number'
    }

    return fieldNames[fieldName] || fieldName
  }

  createUser(event: any): void {
    this.logger.log("event", event)
    if (this.isGovernmentEmployee) {
      const code = this.anmRegistrationForm.value.facilityName.code
      this.anmRegistrationForm.get('facilityName')?.setValue(this.anmRegistrationForm.value.facilityName.name)
      this.anmRegistrationForm.get('facilityCode')?.setValue(String(code))
    }

    // Determine which form data to use
    const currentForm = this.isInService ? this.anmRegistrationForm : (this.isPreService ? this.preServiceForm : this.medicalOfficerForm)
    const formValues = {
      ...currentForm.value,
      phone: +currentForm.value.phone
    }

    // Add service type identifier
    if (this.isPreService) {
      formValues.serviceType = this.isStudent ? 'Student' : 'Faculty'
      formValues.role = formValues.serviceType
    } else if (this.isMedicalOfficerUP) {
      formValues.role = 'Medical Officer-UP'
    }

    const reqUpdate = {
      request: { formValues }
    }

    this.userProfileSvc.upsmfRegistration(reqUpdate).subscribe(
      (res: any) => {
        this.isSubmitting = false
        this.loader.changeLoad.next(false)

        if (res.status === 'SUCCESS') {
          this.resetForm()
          this.showSuccessDialog()
        } else {
          this.openSnackbar(res.message)
        }
      },
      (error) => {
        this.isSubmitting = false
        this.loader.changeLoad.next(false)
        this.openSnackbar(error.error.message)
      }
    )
  }

  private resetForm(): void {
    if (this.isInService) {
      this.anmRegistrationForm.reset()
      this.anmRegistrationForm = this.createInServiceFormGroup()
      this.isGovernmentEmployee = false
      this.isPrivateEmployee = false
    } else if (this.isPreService) {
      this.preServiceForm.reset()
      this.preServiceForm = this.createPreServiceFormGroup()
      this.isStudent = false
      this.isFaculty = false
    } else if (this.isMedicalOfficerUP) {
      this.medicalOfficerForm.reset()
      this.medicalOfficerForm = this.createMedicalOfficerFormGroup()
    }

    this.otpPage = false
  }

  private showSuccessDialog(): void {
    const message = 'कृपया ई-क्षमता ऐप डाउनलोड करें और दिए गए मोबाइल नंबर के साथ ओटीपी का उपयोग करके लॉगिन करें । Kindly download the e- Kshamata app and login using your given mobile number with OTP'

    this.dialog.open(BnrcmodalComponent, {
      width: '350px',
      height: '305px',
      panelClass: 'overview-modal',
      disableClose: true,
      data: {
        message: message,
        from: 'Upsmf'
      },
    })
  }

  public openSnackbar(primaryMsg: string, duration: number = 10000): void {
    this.snackBar.open(primaryMsg, 'X', { duration })
  }

  // Utility method for field assignment (if needed for pre-service form)
  assignFields(fieldName: string, value: any, event: any): void {
    this.logger.log('Field assignment:', fieldName, value, event)
    // Additional field processing logic can be added here if needed
  }
}
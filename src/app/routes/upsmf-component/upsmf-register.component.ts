import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { HttpClient } from '@angular/common/http'

import { ConfigurationsService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { LoaderService } from '../../../../project/ws/author/src/public-api'
import { BnrcmodalComponent } from '../bnrc-popup/bnrc-modal-component'

@Component({
  selector: 'ws-upsmf-register',
  templateUrl: './upsmf-register.component.html',
  styleUrls: ['./upsmf-register.component.scss'],
})
export class UpsmfRegisterComponent implements OnInit {
  anmRegistrationForm: FormGroup
  districts: string[] = [];
  blocks: string[] = [];
  facilityTypes: string[] = [];
  availableFacilities: any[] = [];

  // UI State
  showbackButton = false;
  otpPage = false;
  isSubmitting = false;
  isGovernmentEmployee = false;
  isPrivateEmployee = false;
  isEkshamata = true; // Flag for DOB component

  // Data URLs
  biharDistrictUrl = `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/up_District.json?cb=${Date.now()}`;
  biharDistrictData: any = {};

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
  ) {
    this.anmRegistrationForm = this.createFormGroup()
  }

  ngOnInit() {
    this.loadDistrictData()
    this.setupFormSubscriptions()
    this.setupResponsiveLayout()
  }

  private createFormGroup(): FormGroup {
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
      facilityName: new FormControl('')
    })
  }

  private loadDistrictData(): void {
    console.log("called")
    this.http.get(this.biharDistrictUrl).subscribe((districtData: any) => {
      console.log("districtData", districtData.length > 0)
      if (Array.isArray(districtData) && districtData.length > 0) {
        this.biharDistrictData = districtData[0]
        this.districts = Object.keys(this.biharDistrictData)
      }
    })
  }

  private setupFormSubscriptions(): void {
    // District change for government employees
    this.anmRegistrationForm.get('district')?.valueChanges.subscribe(selectedDistrict => {
      this.onDistrictChange(selectedDistrict)
    })

    // Block change for government employees
    this.anmRegistrationForm.get('block')?.valueChanges.subscribe(selectedBlock => {
      this.onBlockChange(selectedBlock)
    })

    // Facility type change
    this.anmRegistrationForm.get('facilityType')?.valueChanges.subscribe(facilityType => {
      this.onFacilityTypeChange(facilityType)
    })
  }

  private setupResponsiveLayout(): void {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.showbackButton = isXSmall
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
    }
  }

  onDobChange(dobValue: string): void {
    this.anmRegistrationForm.get('dob')?.setValue(dobValue)
    this.anmRegistrationForm.get('dob')?.updateValueAndValidity()
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

  private resetFormValidation(): void {
    const governmentFields = ['serviceType', 'hrmsId', 'district', 'block', 'facilityType', 'facilityName']
    const privateFields = ['district', 'facilityName'];

    [...governmentFields, ...privateFields].forEach(fieldName => {
      const control = this.anmRegistrationForm.get(fieldName)
      if (control) {
        control.clearValidators()
        control.setValue('')
        control.updateValueAndValidity()
      }
    })
  }

  private setGovernmentValidators(): void {
    this.anmRegistrationForm.controls.role.setValue('ANM-UP')
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
    this.anmRegistrationForm.controls.role.setValue('ANM-UP')
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

  onSubmit(): void {
    this.anmRegistrationForm.markAllAsTouched()

    if (this.anmRegistrationForm.valid) {
      this.loader.changeLoad.next(true)
      this.isSubmitting = true

      const phone = { phone: this.anmRegistrationForm.value.phone }

      this.userProfileSvc.bnrcSendOtp(phone).subscribe(
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
      this.handleFormErrors()
    }
  }

  private handleFormErrors(): void {
    const missingFields: string[] = []

    Object.keys(this.anmRegistrationForm.controls).forEach(controlName => {
      const control = this.anmRegistrationForm.get(controlName)
      if (control && control.errors && control.errors['required']) {
        missingFields.push(this.getFieldDisplayName(controlName))
      }
    })

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
      facilityName: 'Facility Name'
    }

    return fieldNames[fieldName] || fieldName
  }

  createUser(event: any): void {
    console.log("event", event)
    const formValues = {
      ...this.anmRegistrationForm.value,
      phone: +this.anmRegistrationForm.value.phone
    }

    const reqUpdate = {
      request: { formValues }
    }

    this.userProfileSvc.bnrcRegistration(reqUpdate).subscribe(
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
    this.anmRegistrationForm.reset()
    this.anmRegistrationForm = this.createFormGroup()
    this.isGovernmentEmployee = false
    this.isPrivateEmployee = false
    this.otpPage = false
  }

  private showSuccessDialog(): void {
    this.dialog.open(BnrcmodalComponent, {
      width: '350px',
      height: '305px',
      panelClass: 'overview-modal',
      disableClose: true,
      data: { message: 'कृपया ई-क्षमता ऐप डाउनलोड करें और दिए गए मोबाइल नंबर के साथ ओटीपी का उपयोग करके लॉगिन करें । Kindly download the e- Kshamata app and login using your given mobile number with OTP.', from: 'Upsmf' },
    })
  }

  public openSnackbar(primaryMsg: string, duration: number = 10000): void {
    this.snackBar.open(primaryMsg, 'X', { duration })
  }
}
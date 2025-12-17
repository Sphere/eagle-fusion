import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { LoaderService } from '../../../../project/ws/author/src/public-api'
import { BnrcmodalComponent } from '../bnrc-popup/bnrc-modal-component'

@Component({
  selector: 'ws-mp-register',
  templateUrl: './mp-register.component.html',
  styleUrls: ['./mp-register.component.scss'],
})
export class MpRegisterComponent implements OnInit {
  anmRegistrationForm: FormGroup
  isSubmitting = false
  otpPage = false
  showbackButton = false
  isFormValid = false

  // Dropdown data
  districts: string[] = []
  blocks: string[] = []
  facilityTypes: string[] = []
  availableFacilities: any[] = []
  biharDistrictData: any = {}
  showCustomFacilityInput = false
  showCustomBlockInput = false
  showFacilityTypeAsInput = false
  showFacilityNameAsInput = false
  allFacilityTypes: string[] = []

  // JSON URLs
  mpANMDistrictUrl = `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/mp_anm_District.json?cb=${Date.now()}`
  mpCHODistrictUrl = `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/mp_cho_District.json?cb=${Date.now()}`
  mpTRAINERDistrictUrl = `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/mp_trainer_district.json?cb=${Date.now()}`

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

  ngOnInit(): void {
    this.loadDistrictData()
    this.setupFormSubscriptions()
    this.setupResponsiveLayout()
    // Track form validity changes
    this.anmRegistrationForm.statusChanges.subscribe(() => {
      this.isFormValid = this.anmRegistrationForm.valid
    })
  }

  /** Create single unified form */
  private createFormGroup(): FormGroup {
    return this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      role: ['', Validators.required],
      district: ['', Validators.required],
      block: ['', Validators.required],
      blockOthers: [''],
      customBlockName: [''],
      facilityType: ['', Validators.required],
      customFacilityType: [''],
      facilityName: ['', Validators.required],
      facilityCode: [''],
      facilityNameOthers: [''],
      customFacilityName: ['']
    })
  }

  /** Load district JSON */
  private loadDistrictData(): void {
    const url = this.mpANMDistrictUrl

    this.http.get(url).subscribe((districtData: any) => {
      if (Array.isArray(districtData) && districtData.length > 0) {
        this.biharDistrictData = districtData[0]
        this.districts = Object.keys(this.biharDistrictData)
      } else {
        this.biharDistrictData = {}
        this.districts = []
      }
      console.log("distritc", this.districts)
      this.resetDropdownsBelow('district')
    })
  }

  /** Form change subscriptions */
  private setupFormSubscriptions(): void {
    // Role change → load S3 JSON
    // this.anmRegistrationForm.get('role')?.valueChanges.subscribe(role => {
    //   // if (role) {
    //   //   this.anmRegistrationForm.patchValue({
    //   //     district: '',
    //   //     block: '',
    //   //     facilityType: '',
    //   //     facilityName: '',
    //   //     facilityCode: ''
    //   //   })
    //   //   this.districts = []
    //   //   this.blocks = []
    //   //   this.facilityTypes = []
    //   //   this.availableFacilities = []
    //   // }
    // })

    // District change → populate blocks
    this.anmRegistrationForm.get('district')?.valueChanges.subscribe(selectedDistrict => {
      if (selectedDistrict && this.biharDistrictData[selectedDistrict]) {
        this.blocks = Object.keys(this.biharDistrictData[selectedDistrict])
        // Add "Others" option if not already present
        if (!this.blocks.includes('Others')) {
          this.blocks.push('Others')
        }
      } else {
        this.blocks = []
      }
      // Reset dependent fields but don't reset blocks
      this.facilityTypes = []
      this.availableFacilities = []
      this.showCustomBlockInput = false
      this.showFacilityTypeAsInput = false
      this.showFacilityNameAsInput = false
      this.anmRegistrationForm.patchValue({
        block: '',
        blockOthers: '',
        customBlockName: '',
        facilityType: '',
        customFacilityType: '',
        facilityName: '',
        customFacilityNameForOthersBlock: '',
        facilityCode: ''
      })
    })

    // Block change → populate facility types or show custom input
    this.anmRegistrationForm.get('block')?.valueChanges.subscribe(selectedBlock => {
      const district = this.anmRegistrationForm.get('district')?.value

      if (selectedBlock === 'Others') {
        // Show custom block input
        this.showCustomBlockInput = true
        this.showFacilityTypeAsInput = false
        this.showFacilityNameAsInput = true
        this.anmRegistrationForm.patchValue({
          blockOthers: 'Others',
          customBlockName: '',
          facilityType: '',
          customFacilityType: '',
          facilityName: '',
          customFacilityName: ''
        })
        this.anmRegistrationForm.get('customBlockName')?.setValidators([Validators.required])
        this.anmRegistrationForm.get('customBlockName')?.updateValueAndValidity()
        this.anmRegistrationForm.get('facilityType')?.setValidators([Validators.required])
        this.anmRegistrationForm.get('facilityType')?.updateValueAndValidity()
        this.anmRegistrationForm.get('customFacilityName')?.setValidators([Validators.required])
        this.anmRegistrationForm.get('customFacilityName')?.updateValueAndValidity()
        // Clear facilityName validator since we're using customFacilityName for Others block
        this.anmRegistrationForm.get('facilityName')?.clearValidators()
        this.anmRegistrationForm.get('facilityName')?.updateValueAndValidity()
        // Get all facility types from all blocks
        this.allFacilityTypes = this.getAllFacilityTypes(district)
        this.facilityTypes = this.allFacilityTypes
      } else {
        this.showCustomBlockInput = false
        this.showFacilityTypeAsInput = false
        this.showFacilityNameAsInput = false
        this.anmRegistrationForm.get('customBlockName')?.clearValidators()
        this.anmRegistrationForm.get('customBlockName')?.updateValueAndValidity()
        // For normal blocks, facility type is required
        this.anmRegistrationForm.get('facilityType')?.setValidators([Validators.required])
        this.anmRegistrationForm.get('facilityType')?.updateValueAndValidity()
        this.anmRegistrationForm.get('customFacilityName')?.clearValidators()
        this.anmRegistrationForm.get('customFacilityName')?.updateValueAndValidity()
        // Set facilityName validator for normal blocks
        this.anmRegistrationForm.get('facilityName')?.setValidators([Validators.required])
        this.anmRegistrationForm.get('facilityName')?.updateValueAndValidity()
        this.anmRegistrationForm.patchValue({
          blockOthers: '',
          customBlockName: '',
          customFacilityType: ''
        })

        if (district && selectedBlock && this.biharDistrictData[district][selectedBlock]) {
          this.facilityTypes = Object.keys(this.biharDistrictData[district][selectedBlock])
        } else {
          this.facilityTypes = []
        }
      }
      // Reset facility type and name fields
      this.availableFacilities = []
      this.anmRegistrationForm.patchValue({
        facilityType: '',
        customFacilityType: '',
        facilityName: '',
        facilityCode: ''
      })
    })    // Facility type change → populate facility names
    this.anmRegistrationForm.get('facilityType')?.valueChanges.subscribe(selectedFacilityType => {
      const district = this.anmRegistrationForm.get('district')?.value
      const block = this.anmRegistrationForm.get('block')?.value
      const blockOthers = this.anmRegistrationForm.get('blockOthers')?.value

      // If Others block is selected, populate facilities from all blocks
      if (blockOthers === 'Others' && selectedFacilityType) {
        this.availableFacilities = []
        // Search through all blocks for facilities of this type
        if (this.biharDistrictData[district]) {
          Object.keys(this.biharDistrictData[district]).forEach(blockKey => {
            if (this.biharDistrictData[district][blockKey][selectedFacilityType]) {
              this.availableFacilities.push(...this.biharDistrictData[district][blockKey][selectedFacilityType])
            }
          })
        }
      } else if (district && block && selectedFacilityType && this.biharDistrictData[district][block][selectedFacilityType]) {
        // Normal block - use specific block's facilities
        this.availableFacilities = [...this.biharDistrictData[district][block][selectedFacilityType]]
      } else {
        this.availableFacilities = []
      }

      // Add "Others" option if not already present
      if (!this.availableFacilities.find(f => f.name === 'Others')) {
        this.availableFacilities.push({ name: 'Others' })
      }

      this.showCustomFacilityInput = false
      this.anmRegistrationForm.patchValue({
        facilityName: '',
        facilityCode: '',
        facilityNameOthers: '',
        customFacilityName: ''
      })
    })

    // Facility name change → populate facility code or show custom input
    this.anmRegistrationForm.get('facilityName')?.valueChanges.subscribe(selectedFacilityName => {
      if (selectedFacilityName === 'Others') {
        this.showCustomFacilityInput = true
        this.anmRegistrationForm.patchValue({
          facilityCode: '',
          facilityNameOthers: 'Others',
          customFacilityName: ''
        })
        this.anmRegistrationForm.get('customFacilityName')?.setValidators([Validators.required])
        this.anmRegistrationForm.get('customFacilityName')?.updateValueAndValidity()
      } else {
        this.showCustomFacilityInput = false
        this.anmRegistrationForm.get('customFacilityName')?.clearValidators()
        this.anmRegistrationForm.get('customFacilityName')?.updateValueAndValidity()

        const district = this.anmRegistrationForm.get('district')?.value
        const block = this.anmRegistrationForm.get('block')?.value
        const facilityType = this.anmRegistrationForm.get('facilityType')?.value
        if (district && block && selectedFacilityName && this.biharDistrictData[district][block][facilityType]) {
          const selectedObject = this.biharDistrictData[district][block][facilityType].find(x => x.name === selectedFacilityName)
          this.anmRegistrationForm.get('facilityCode')?.setValue(selectedObject?.code ? `${selectedObject?.code}` : '')
          this.anmRegistrationForm.patchValue({ facilityNameOthers: '' })
        }
      }
    })
  }

  private setupResponsiveLayout(): void {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.showbackButton = isXSmall
    })
  }

  private resetDropdownsBelow(field: string): void {
    if (field === 'facilityType') {
      this.availableFacilities = []
      this.anmRegistrationForm.patchValue({ facilityName: '', facilityCode: '' })
    }
  } private getAllFacilityTypes(district: string): string[] {
    const allTypes = new Set<string>()
    if (district && this.biharDistrictData[district]) {
      const blocks = this.biharDistrictData[district]
      Object.keys(blocks).forEach(blockName => {
        if (blockName !== 'Others' && blocks[blockName]) {
          Object.keys(blocks[blockName]).forEach(type => {
            allTypes.add(type)
          })
        }
      })
    }
    return Array.from(allTypes).sort()
  }

  // ---------- Form Submission ----------
  onSubmit(): void {
    this.anmRegistrationForm.markAllAsTouched()

    // Additional validation checks for conditional fields
    const facilityType = this.anmRegistrationForm.get('facilityType')?.value
    const customBlockName = this.anmRegistrationForm.get('customBlockName')?.value
    const blockOthers = this.anmRegistrationForm.get('blockOthers')?.value
    const customFacilityName = this.anmRegistrationForm.get('customFacilityName')?.value
    const showFacilityNameAsInput = this.showFacilityNameAsInput

    // Validate conditional required fields
    if (blockOthers === 'Others' && !customBlockName) {
      this.openSnackbar('Block Name is required when "Others" is selected')
      return
    }

    if (!facilityType) {
      this.openSnackbar('Facility Type is required')
      return
    }

    if (showFacilityNameAsInput && !customFacilityName) {
      this.openSnackbar('Facility Name is required')
      return
    }

    if (this.anmRegistrationForm.valid) {
      this.loader.changeLoad.next(true)
      this.isSubmitting = true
      const phone = { phone: this.anmRegistrationForm.value.phone }

      this.userProfileSvc.mpSendOtp(phone).subscribe(
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

  private handleFormErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName)
      if (control?.errors?.['required']) {
        console.warn(`${controlName} is required.`)
      }
    })
  }

  createUser(): void {
    const formValues = { ...this.anmRegistrationForm.value, phone: +this.anmRegistrationForm.value.phone }

    // Handle block: if "Others" was selected, use customBlockName as block
    if (formValues.blockOthers === 'Others' && formValues.customBlockName) {
      formValues.block = formValues.customBlockName
    }

    // Handle facility name based on different scenarios
    if (formValues.blockOthers === 'Others' && formValues.customFacilityName) {
      // When Others block is selected, use customFacilityName as facility name
      formValues.facilityName = formValues.customFacilityName
    } else if (formValues.facilityNameOthers === 'Others' && formValues.customFacilityName) {
      // When Others facility is selected from dropdown, use customFacilityName
      formValues.facilityName = formValues.customFacilityName
    } else if (formValues.facilityName && formValues.facilityCode) {
      // When a proper facility is selected, concatenate name and code
      formValues.facilityName = `${formValues.facilityName} - ${formValues.facilityCode}`
    }

    // Clean up unnecessary fields before sending
    // delete formValues.blockOthers
    delete formValues.customBlockName
    delete formValues.customFacilityType
    // delete formValues.facilityNameOthers
    delete formValues.customFacilityName

    const reqUpdate = { request: { formValues } }

    this.userProfileSvc.mpRegistration(reqUpdate).subscribe(
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
    this.otpPage = false
  }

  private showSuccessDialog(): void {
    const message = 'कृपया ई-क्षमता ऐप डाउनलोड करें और दिए गए मोबाइल नंबर के साथ ओटीपी का उपयोग करके लॉगिन करें । Kindly download the e-Kshamata app and login using your given mobile number with OTP'

    this.dialog.open(BnrcmodalComponent, {
      width: '350px',
      height: '305px',
      panelClass: 'overview-modal',
      disableClose: true,
      data: { message, from: 'Upsmf' },
    })
  }

  public openSnackbar(primaryMsg: string, duration: number = 10000): void {
    this.snackBar.open(primaryMsg, 'X', { duration })
  }

  assignFields(fieldName: string, value: any, event: any): void {
    console.log('Field assignment:', fieldName, value, event)
  }
}

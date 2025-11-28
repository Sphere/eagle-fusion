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

  // Dropdown data
  districts: string[] = []
  blocks: string[] = []
  facilityTypes: string[] = []
  availableFacilities: any[] = []
  biharDistrictData: any = {}

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
    this.setupFormSubscriptions()
    this.setupResponsiveLayout()
  }

  /** Create single unified form */
  private createFormGroup(): FormGroup {
    return this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      role: ['', Validators.required], // ANM-MP or CHO-MP
      district: ['', Validators.required],
      block: ['', Validators.required],
      facilityType: ['', Validators.required],
      facilityName: ['', Validators.required],
      facilityCode: ['']
    })
  }

  /** Load district JSON based on role */
  private loadDistrictData(role: string): void {
    let url = this.mpCHODistrictUrl

    if (role === 'ANM-MP') {
      url = this.mpANMDistrictUrl
    } else if (role === 'Trainer-MP') {
      url = this.mpTRAINERDistrictUrl
    }

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
    this.anmRegistrationForm.get('role')?.valueChanges.subscribe(role => {
      if (role) {
        this.anmRegistrationForm.patchValue({
          district: '',
          block: '',
          facilityType: '',
          facilityName: '',
          facilityCode: ''
        })
        this.districts = []
        this.blocks = []
        this.facilityTypes = []
        this.availableFacilities = []
        this.loadDistrictData(role)
      }
    })

    // District change → populate blocks
    this.anmRegistrationForm.get('district')?.valueChanges.subscribe(selectedDistrict => {
      if (selectedDistrict && this.biharDistrictData[selectedDistrict]) {
        this.blocks = Object.keys(this.biharDistrictData[selectedDistrict])
      } else {
        this.blocks = []
      }
      this.resetDropdownsBelow('block')
    })

    // Block change → populate facility types
    this.anmRegistrationForm.get('block')?.valueChanges.subscribe(selectedBlock => {
      const district = this.anmRegistrationForm.get('district')?.value
      if (district && selectedBlock && this.biharDistrictData[district][selectedBlock]) {
        this.facilityTypes = Object.keys(this.biharDistrictData[district][selectedBlock])
      } else {
        this.facilityTypes = []
      }
      this.resetDropdownsBelow('facilityType')
    })

    // Facility type change → populate facility names
    this.anmRegistrationForm.get('facilityType')?.valueChanges.subscribe(selectedFacilityType => {
      const district = this.anmRegistrationForm.get('district')?.value
      const block = this.anmRegistrationForm.get('block')?.value
      if (district && block && selectedFacilityType && this.biharDistrictData[district][block][selectedFacilityType]) {
        this.availableFacilities = this.biharDistrictData[district][block][selectedFacilityType]
      } else {
        this.availableFacilities = []
      }
      this.anmRegistrationForm.get('facilityName')?.reset()
    })

    // Facility name change → populate facility code
    this.anmRegistrationForm.get('facilityName')?.valueChanges.subscribe(selectedFacilityName => {
      const district = this.anmRegistrationForm.get('district')?.value
      const block = this.anmRegistrationForm.get('block')?.value
      const facilityType = this.anmRegistrationForm.get('facilityType')?.value
      if (district && block && selectedFacilityName && this.biharDistrictData[district][block][facilityType]) {
        const selectedObject = this.biharDistrictData[district][block][facilityType].find(x => x.name === selectedFacilityName)
        this.anmRegistrationForm.get('facilityCode')?.setValue(selectedObject?.code ? `${selectedObject?.code}` : '')
      }
    })
  }

  private setupResponsiveLayout(): void {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.showbackButton = isXSmall
    })
  }

  private resetDropdownsBelow(field: string): void {
    if (field === 'district') {
      this.blocks = []
      this.facilityTypes = []
      this.availableFacilities = []
      this.anmRegistrationForm.patchValue({ block: '', facilityType: '', facilityName: '', facilityCode: '' })
    } else if (field === 'block') {
      this.facilityTypes = []
      this.availableFacilities = []
      this.anmRegistrationForm.patchValue({ facilityType: '', facilityName: '', facilityCode: '' })
    } else if (field === 'facilityType') {
      this.availableFacilities = []
      this.anmRegistrationForm.patchValue({ facilityName: '', facilityCode: '' })
    }
  }

  // ---------- Form Submission ----------
  onSubmit(): void {
    this.anmRegistrationForm.markAllAsTouched()
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

import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { ConfigurationsService, LoggerService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '@ws-widget/collection'
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import { NsUserProfileDetails } from '@ws/app/src/lib/routes/user-profile/models/NsUserProfile'
import * as _ from 'lodash'
import { HttpClient } from '@angular/common/http'
import { BnrcmodalComponent } from '../bnrc-popup/bnrc-modal-component'
import { LoaderService } from '../../../../project/ws/author/src/public-api'
import { startWith, map, tap } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { S3_END_POINTS } from '../../constants/apiConstants'

/** Last option of the Staff Nurses facility list; the user then types the facility name. */
export const FACILITY_OTHERS = 'Others'

/** Sent as postingLevel (ui-proxies 6.0.6+ stores it): Sadar and Sub Divisional hospitals are
 * district-level facilities, every other type is block-level. */
export const POSTING_DISTRICT = 'District'
export const POSTING_BLOCK = 'Block'
const DISTRICT_LEVEL_TYPES = ['SH', 'SDH']
/** The only type with no block question. */
const SADAR_HOSPITAL = 'SH'

/** Tab text per facility type code; a code missing here shows the file's own label. */
export const FACILITY_TYPE_LABELS: Record<string, string> = {
  SH: 'Sadar Hospital / सदर अस्पताल',
  SDH: 'Sub Divisional Hospital / अनुमंडलीय अस्पताल',
  RH: 'Referral Hospital / रेफरल अस्पताल',
  CHC: 'CHC / सामुदायिक स्वास्थ्य केंद्र',
  PHC: 'PHC / प्राथमिक स्वास्थ्य केंद्र',
  APHC: 'APHC / अतिरिक्त प्राथमिक स्वास्थ्य केंद्र',
}

/** bihar-staff-nurse-facilities-v2.json (S3_END_POINTS.biharStaffNurseFacilityUrl): per facility
 * type, district -> block -> facilities, named as in the source sheet (e.g. "PHC, MAHUA"). For
 * APHCs the block is the sheet's "Name of PHC". */
export interface StaffNurseFacilityType {
  code: string
  label: string
  districts: Record<string, Record<string, string[]>>
}
export interface StaffNurseFacilityData {
  facilityTypes: StaffNurseFacilityType[]
}
const FACILITY_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ,.()/-]*$/

@Component({
    standalone: false,
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
  @Output() passProfession = new EventEmitter<string>()
  showLogOutIcon = false
  trigerrNavigation = true
  bnrcDetailForm: UntypedFormGroup
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
  cho = false
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
  districts: any = []
  institutes: any = []
  filteredInstitutes!: Observable<any[]>
  isSubmitting = false
  isInservice = false
  isANM = false
  isCHO = false
  // ?service=StaffNurse — the CHO form without the role choice, and a facility list that ends in "Others"
  isStaffNurse = false
  readonly facilityOthers = FACILITY_OTHERS
  // Staff Nurses' own type -> district -> block -> facility lists (a separate file from the CHO data).
  staffNurseTypes: StaffNurseFacilityType[] = []
  staffNurseDistricts: string[] = []
  staffNurseBlocks: string[] = []
  staffNurseFacilities: string[] = []
  // Block step: none (Sadar Hospital, or nothing chosen yet), a dropdown of the district's blocks
  // for the type plus "Others", or a typed block when the district has none for the type.
  staffNurseBlockMode: 'none' | 'select' | 'input' = 'none'
  // The institute is typed (no list for it, or the block was typed).
  staffNurseFacilityTyped = false
  message = ''
  // instituteNameUrl = '../../../fusion-assets/files/district_institutes_option_a.json'
  institutesData: any = []
  currentDistrictInstitutes: any = []
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  hrmsErr = false
  bnrcErr = false
  showMessage = false
  blocks: string[] = []
  aamShcList: { name: string; nin: number }[] = []

  selectedDistrict = ''
  selectedBlock = ''


  biharDistrictData: any = {}
  aamShcs: { name: string; nin: number }[] = []
  service: any

  registrationData: any = {} // your final JSON goes here
  constructor(
    public configSvc: ConfigurationsService,
    public userProfileSvc: UserProfileService,
    // private router: Router,
    public valueSvc: ValueService,
    public contentSvc: WidgetContentService,
    public UserAgentResolverService: UserAgentResolverService,
    public snackBar: MatSnackBar,
    public http: HttpClient,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly dialog: MatDialog,
    private readonly loader: LoaderService,
    private readonly route: ActivatedRoute,
    private readonly logger: LoggerService
  ) {
    this.bnrcDetailForm = this.formBuilder.group({
      firstName: new UntypedFormControl('', [Validators.required]),
      lastName: new UntypedFormControl('', [Validators.required]),
      phone: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
      email: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      role: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)]),
      district: new UntypedFormControl('', [Validators.required]),
      block: new UntypedFormControl('', []),
      nin: new UntypedFormControl({ disabled: true }),
      instituteName: new UntypedFormControl('', []),
      courseSelection: new UntypedFormControl('', []),
      instituteType: new UntypedFormControl('', []),
      bnrcRegistrationNumber: new UntypedFormControl('', []),
      hrmsId: new UntypedFormControl('', []),
      facultyType: new UntypedFormControl('', []),
      facilityName: new UntypedFormControl('', []),
      roleForInService: new UntypedFormControl('', []),
      publicFacilityType: new UntypedFormControl('', []),
      privateFacilityType: new UntypedFormControl('', []),
      serviceType: new UntypedFormControl('', []),
      customFacilityName: new UntypedFormControl('', []),
      customBlockName: new UntypedFormControl('', []),
      facilityType: new UntypedFormControl('', []),
    })
  }

  get facilityType(): string {
    return this.bnrcDetailForm.get('facilityType')?.value || ''
  }

  get selectedStaffNurseType(): StaffNurseFacilityType | undefined {
    return this.staffNurseTypes.find(type => type.code === this.facilityType)
  }

  /** The institute step shows once district and type are chosen and, when the block is a dropdown,
   * a block (or "Others") is picked. */
  get staffNurseFacilityReady(): boolean {
    if (!this.facilityType || !this.bnrcDetailForm.get('district')?.value) return false
    return this.staffNurseBlockMode !== 'select' || !!this.bnrcDetailForm.get('block')?.value
  }

  /** The block is typed: the district has no block for the type, or "Others" was picked. */
  get staffNurseBlockTyped(): boolean {
    return this.staffNurseBlockMode === 'input'
      || (this.staffNurseBlockMode === 'select' && this.bnrcDetailForm.get('block')?.value === FACILITY_OTHERS)
  }

  facilityTypeLabel(type: StaffNurseFacilityType): string {
    return FACILITY_TYPE_LABELS[type.code] || type.label
  }

  trackByCode(_index: number, type: StaffNurseFacilityType): string {
    return type.code
  }

  get isFacilityOthers(): boolean {
    return this.isStaffNurse && this.bnrcDetailForm.get('facilityName')?.value === FACILITY_OTHERS
  }

  // Define the form group creation in a separate method
  createFormGroup(): UntypedFormGroup {
    return this.formBuilder.group({
      firstName: new UntypedFormControl('', [Validators.required]),
      lastName: new UntypedFormControl('', [Validators.required]),
      phone: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
      email: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      role: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)]),
      district: new UntypedFormControl('', [Validators.required]),
      block: new UntypedFormControl('', []),
      nin: new UntypedFormControl({ value: '', disabled: true }),
      instituteName: new UntypedFormControl('', []),
      courseSelection: new UntypedFormControl('', []),
      instituteType: new UntypedFormControl('', []),
      bnrcRegistrationNumber: new UntypedFormControl('', []),
      hrmsId: new UntypedFormControl('', []),
      facultyType: new UntypedFormControl('', []),
      facilityName: new UntypedFormControl('', []),
      roleForInService: new UntypedFormControl('', []),
      publicFacilityType: new UntypedFormControl('', []),
      privateFacilityType: new UntypedFormControl('', []),
      serviceType: new UntypedFormControl('', []),
      customFacilityName: new UntypedFormControl('', []),
      customBlockName: new UntypedFormControl('', []),
      facilityType: new UntypedFormControl('', []),
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
    this.cho = false
    this.bnrcDetailForm = this.createFormGroup() // Create a new form group with initial values and validators
  }
  onDistrictChange() {
    this.blocks = this.selectedDistrict
      ? Object.keys(this.registrationData[this.selectedDistrict])
      : []
    this.selectedBlock = ''
    this.aamShcList = []
  }

  onBlockChange() {
    this.aamShcList = this.registrationData[this.selectedDistrict]?.[this.selectedBlock] || []
  }
  ngOnInit() {
    this.http.get(S3_END_POINTS.biharDistrictUrl).subscribe((districtData: any) => {
      this.logger.log("districtData", districtData)
      if (Array.isArray(districtData) && districtData.length > 0) {
        this.biharDistrictData = districtData[0]
        this.districts = Object.keys(this.biharDistrictData)
      }
    })


    this.bnrcDetailForm.get('district')?.valueChanges.subscribe(selectedDistrict => {
      if (this.isStaffNurse) {
        this.onStaffNurseDistrictChange(selectedDistrict)
        return
      }
      this.blocks = selectedDistrict ? Object.keys(this.biharDistrictData[selectedDistrict] || {}) : []
      this.bnrcDetailForm.get('block')?.reset()
      this.bnrcDetailForm.get('facilityName')?.reset()
      this.bnrcDetailForm.get('nin')?.reset()
      this.aamShcs = []
      const instCtrl = this.bnrcDetailForm.get('instituteName')

      // reset input box
      if (this.service == 'Student' && this.service == 'Faculty') {
        instCtrl?.setValue(null, { emitEvent: false })
        instCtrl?.setErrors({ required: true })
        instCtrl?.markAsTouched()
      }

      // load institutes of district
      if (selectedDistrict) {
        const districtInstitutes = this.institutesData[selectedDistrict] || []
        this.currentDistrictInstitutes = districtInstitutes.map(name => ({ name }))
        this.institutes = this.currentDistrictInstitutes          // 🔥 FIX
      } else {
        this.currentDistrictInstitutes = []
        this.institutes = []                                      // 🔥 FIX
      }

      this.filteredInstitutes = this.bnrcDetailForm.controls['instituteName'].valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value)),
      )
    })




    this.bnrcDetailForm.get('block')?.valueChanges.subscribe(selectedBlock => {
      const selectedDistrict = this.bnrcDetailForm.get('district')?.value
      if (this.isStaffNurse) {
        this.onStaffNurseBlockChange(selectedDistrict, selectedBlock)
        return
      }

      this.bnrcDetailForm.get('facilityName')?.reset()
      this.bnrcDetailForm.get('nin')?.reset()
      if (selectedDistrict && selectedBlock) {
        this.aamShcs = this.biharDistrictData[selectedDistrict]?.[selectedBlock] || []
      } else {
        this.aamShcs = []
      }
    })
    this.bnrcDetailForm.get('facilityType')?.valueChanges.subscribe(code => this.onFacilityTypeChange(code))

    this.bnrcDetailForm.get('facilityName')?.valueChanges.subscribe(selectedShc => {
      this.logger.log("selectedShc", selectedShc)
      if (selectedShc && selectedShc.nin) {
        this.bnrcDetailForm.get('nin')?.setValue(selectedShc.nin)
      } else {
        this.bnrcDetailForm.get('nin')?.reset()
      }
      if (this.isStaffNurse) {
        this.applyFacilityOthers(selectedShc === FACILITY_OTHERS || this.staffNurseFacilityTyped)
      }
    })



    this.http.get(S3_END_POINTS.instituteNameUrl).subscribe((instituteData: any) => {
      this.institutesData = instituteData   // full district → list json

      // default empty list
      this.currentDistrictInstitutes = []

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
      this.service = service
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
      if (service === 'CHO') {
        this.isANM = false
        this.isInservice = false
        this.inServiceGNM = false
        this.isCHO = true
        this.professions = ['In Service']
        this.bnrcDetailForm.controls.role.setValue('In Service')
        this.professionalChange('CHO')
        // CHO and Staff Nurses have separate forms now (?service=CHO / ?service=StaffNurse)
        this.bnrcDetailForm.controls.roleForInService.setValue('CHO')
      }
      if (service === 'StaffNurse') {
        this.isANM = false
        this.isInservice = false
        this.inServiceGNM = false
        this.isCHO = false
        this.isStaffNurse = true
        this.professions = ['In Service']
        this.bnrcDetailForm.controls.role.setValue('In Service')
        this.professionalChange('CHO')
        this.bnrcDetailForm.controls.roleForInService.setValue('Staff Nurses')
        this.setupStaffNurseForm()
      }
    })
    this.logger.log("districts", this.districts)
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
    if (!value) return this.currentDistrictInstitutes

    const filterValue = value.toLowerCase().replaceAll(',', '')

    return this.currentDistrictInstitutes.filter(ins =>
      ins.name.toLowerCase().replaceAll(',', '').includes(filterValue)
    )
  }



  /** "Others" needs a typed facility name. Staff Nurses have no NIN at all, so it is never
   * required for them; the CHO form does not use this path. */
  applyFacilityOthers(isOthers: boolean) {
    const custom = this.bnrcDetailForm.get('customFacilityName')
    if (isOthers) {
      custom?.setValidators([Validators.required, Validators.pattern(FACILITY_NAME_PATTERN)])
    } else {
      custom?.clearValidators()
      custom?.setValue('', { emitEvent: false })
    }
    custom?.updateValueAndValidity({ emitEvent: false })
  }

  /** Staff Nurses: load their facility file, ask the facility type first, and drop the NIN
   * requirement the shared CHO setup added. */
  setupStaffNurseForm() {
    const setRequired = (field: string, required: boolean) => {
      const control = this.bnrcDetailForm.get(field)
      control?.setValidators(required ? [Validators.required] : [])
      control?.updateValueAndValidity({ emitEvent: false })
    }
    setRequired('facilityType', true)
    setRequired('nin', false)
    setRequired('block', false)
    this.http.get<StaffNurseFacilityData>(S3_END_POINTS.biharStaffNurseFacilityUrl).subscribe({
      next: data => {
        this.staffNurseTypes = Array.isArray(data?.facilityTypes) ? data.facilityTypes : []
        // Every district that has any facility type, asked before the type.
        const districts = new Set<string>()
        this.staffNurseTypes.forEach(type => Object.keys(type.districts || {}).forEach(d => districts.add(d)))
        this.staffNurseDistricts = Array.from(districts).sort()
      },
      error: () => {
        this.openSnackbar('Could not load the facility list. Please refresh the page and try again.')
      },
    })
  }

  onFacilityTypeChange(_code: string) {
    if (!this.isStaffNurse) return
    this.refreshStaffNurseSteps()
  }

  onStaffNurseDistrictChange(_district: string) {
    this.refreshStaffNurseSteps()
  }

  /**
   * District + facility type decide the block and institute steps (both start again):
   * - Sadar Hospital: no block question; the district's Sadar Hospital(s) are listed (their sheet
   *   block is sent). A district with none in the list gets a typed institute name.
   * - Any other type: the district's blocks for the type, plus "Others" (typed block and typed
   *   institute). A district with no block for the type gets both typed straight away.
   */
  refreshStaffNurseSteps() {
    const district = this.bnrcDetailForm.get('district')?.value
    const type = this.facilityType
    const byBlock = (district && this.selectedStaffNurseType?.districts[district]) || {}
    const blocks = Object.keys(byBlock)
    this.bnrcDetailForm.patchValue({ block: '', customBlockName: '', facilityName: '' }, { emitEvent: false })
    this.staffNurseBlocks = []
    this.staffNurseFacilities = []
    this.staffNurseBlockMode = 'none'
    this.staffNurseFacilityTyped = false
    if (district && type === SADAR_HOSPITAL) {
      this.bnrcDetailForm.patchValue({ block: blocks[0] || '' }, { emitEvent: false })
      this.staffNurseFacilities = blocks.reduce((all: string[], block) => all.concat(byBlock[block]), [])
      this.staffNurseFacilityTyped = !blocks.length
    } else if (district && type) {
      this.staffNurseBlockMode = blocks.length ? 'select' : 'input'
      this.staffNurseBlocks = blocks
      this.staffNurseFacilityTyped = !blocks.length
    }
    this.applyStaffNurseValidators()
  }

  /** A listed block lists its institutes; "Others" means a typed block and a typed institute. */
  onStaffNurseBlockChange(district: string, block: string) {
    this.bnrcDetailForm.patchValue({ customBlockName: '', facilityName: '' }, { emitEvent: false })
    this.staffNurseFacilityTyped = block === FACILITY_OTHERS
    this.staffNurseFacilities = (!this.staffNurseFacilityTyped && district && block
      && this.selectedStaffNurseType?.districts[district]?.[block]) || []
    this.applyStaffNurseValidators()
  }

  /** Requires exactly the Staff Nurse fields on screen: the block dropdown or the typed block, and
   * the institute dropdown or the typed institute (also typed when "Others" is picked). */
  applyStaffNurseValidators() {
    const set = (field: string, validators: ValidatorFn[]) => {
      const control = this.bnrcDetailForm.get(field)
      control?.setValidators(validators)
      control?.updateValueAndValidity({ emitEvent: false })
    }
    const typedName = [Validators.required, Validators.pattern(FACILITY_NAME_PATTERN)]
    set('block', this.staffNurseBlockMode === 'select' ? [Validators.required] : [])
    set('customBlockName', this.staffNurseBlockTyped ? typedName : [])
    set('facilityName', this.staffNurseFacilityTyped ? [] : [Validators.required])
    this.applyFacilityOthers(this.staffNurseFacilityTyped || this.isFacilityOthers)
  }

  /**
   * The request body. customFacilityName / customBlockName are form-only (the backend rejects
   * unknown fields). For Staff Nurses a typed institute (from "Others", or because there is no list)
   * becomes facilityName = the typed name + facilityNameOthers = 'Others', the same way the MP form
   * saves it, and a typed block is sent as the block.
   */
  buildFormValues(): any {
    // Staff Nurses also send facilityType (ui-proxies 6.0.7+) and postingLevel derived from it
    // (6.0.6+); other Bihar forms send exactly what they did before.
    const { customFacilityName, customBlockName, facilityType, ...formValues } = this.bnrcDetailForm.value
    formValues.phone = +formValues.phone
    if (this.isStaffNurse) {
      formValues.facilityType = facilityType || ''
      formValues.postingLevel = !facilityType ? '' : DISTRICT_LEVEL_TYPES.includes(facilityType) ? POSTING_DISTRICT : POSTING_BLOCK
      // Staff Nurses have no NIN.
      formValues.nin = ''
      if (this.staffNurseBlockTyped) {
        formValues.block = String(customBlockName || '').trim()
      }
      const facility = formValues.facilityName
      if (facility === FACILITY_OTHERS || this.staffNurseFacilityTyped) {
        formValues.facilityName = String(customFacilityName || '').trim()
        formValues.facilityNameOthers = FACILITY_OTHERS
      } else if (facility && typeof facility === 'object') {
        formValues.facilityName = facility.name
      }
    }
    return formValues
  }

  assignFields(fieldName: string, value: string, event: any) {
    this.logger.log(fieldName, value, event)
  }
  serviceTypeChange(value: string) {
    this.logger.log("regulating service type", value)
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
        this.cho = false
        setValidators('instituteName', [Validators.required])
        setValidators('courseSelection', [Validators.required])

        clearValidatorsAndReset([
          'facultyType', 'bnrcRegistrationNumber', 'publicFacilityType', 'roleForInService',
          'serviceType', 'facilityName', 'privateFacilityType', 'hrmsId',
        ])
        break
      }

      case 'Faculty': {
        this.Student = false
        this.Faculty = true
        this.inService = false
        this.publicHealthFacility = false
        this.privateHealthFacility = false
        this.cho = false
        this.hrmsErr = false
        this.bnrcErr = true

        setValidators('instituteName', [Validators.required])
        setValidators('facultyType', [Validators.required])
        setValidators('bnrcRegistrationNumber', [Validators.required])

        clearValidatorsAndReset([
          'courseSelection', 'publicFacilityType', 'roleForInService', 'serviceType',
          'facilityName', 'privateFacilityType', 'hrmsId',
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
        this.cho = false

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
        this.cho = false

        form.controls.publicFacilityType.setValue(this.inServiceGNM ? 'GNM-Bihar' : 'ANM')

        setValidators('publicFacilityType', [Validators.required])
        setValidators('roleForInService', [Validators.required])
        setValidators('serviceType', [Validators.required])
        setValidators('facilityName', [Validators.required])
        setValidators('block', [Validators.required])

        clearValidatorsAndReset([
          'courseSelection', 'facultyType', 'privateFacilityType', 'instituteType', 'instituteName',
        ])
        break
      }

      case 'Private Health Facility': {
        this.Student = false
        this.Faculty = false
        this.inService = false
        this.publicHealthFacility = false
        this.privateHealthFacility = true
        this.cho = false

        form.controls.privateFacilityType.setValue(this.inServiceGNM ? 'GNM-Bihar' : 'ANM')

        setValidators('privateFacilityType', [Validators.required])
        setValidators('facilityName', [Validators.required])
        setValidators('block', [Validators.required])

        clearValidatorsAndReset([
          'courseSelection', 'facultyType', 'hrmsId', 'publicFacilityType',
          'serviceType', 'instituteName', 'instituteType',
        ])
        break
      }

      case 'CHO': {
        this.Student = false
        this.Faculty = false
        this.inService = false
        this.publicHealthFacility = false
        this.privateHealthFacility = false
        this.cho = true

        setValidators('roleForInService', [Validators.required])
        setValidators('district', [Validators.required])
        setValidators('block', [Validators.required])
        setValidators('facilityName', [Validators.required])
        setValidators('nin', [Validators.required])
        setValidators('serviceType', [Validators.required])

        clearValidatorsAndReset([
          'courseSelection', 'facultyType', 'hrmsId', 'publicFacilityType',
          'instituteName', 'instituteType',
        ])
        break
      }

      default: {
        this.Student = false
        this.Faculty = false
        this.inService = false
        this.publicHealthFacility = false
        this.privateHealthFacility = false
        this.cho = false
        break
      }
    }

    form.updateValueAndValidity()
  }

  checkInstitute() {
    if (this.bnrcDetailForm.controls.instituteName.value) {
      const instituteName = this.bnrcDetailForm.controls.instituteName.value.trim().toLowerCase()
      this.logger.log("instituteName", instituteName, this.institutes)

      const isPresent = this.institutes.some((institute: any) =>
        institute.name.trim().toLowerCase() === instituteName
      )
      if (isPresent) {
        this.logger.log("correct value selected")
      } else {
        this.bnrcDetailForm.get('instituteName')?.setValue(null)
        this.bnrcDetailForm.get('instituteName')?.setErrors({ invalidInstitute: true })
      }
    }

  }
  onSubmit() {
    this.bnrcDetailForm.markAllAsTouched()
    this.logger.log("this.bnrcDetailForm", this.bnrcDetailForm)
    this.loader.changeLoad.next(true)

    this.checkInstitute()
    if (this.bnrcDetailForm.valid) {

      const phone = {
        phone: this.bnrcDetailForm.value.phone,
      }
      this.isSubmitting = true
      this.otpPage = true
      this.userProfileSvc.bnrcSendOtp(phone).subscribe((res: any) => {
        if (res.status === 'success') {
          this.otpPage = true
          this.openSnackbar(res.message)
        }
      },
        error => {
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
    this.logger.log("event", event, this.bnrcDetailForm.value)
    if (this.isCHO) {
      const nin = this.bnrcDetailForm.value.facilityName.nin
      this.bnrcDetailForm.get('facilityName')?.setValue(this.bnrcDetailForm.value.facilityName.name)
      this.bnrcDetailForm.get('nin')?.setValue(String(nin))
    }
    const formValues = this.buildFormValues()
    const reqUpdate = {
      request: {
        formValues,
      },
    }
    this.userProfileSvc.bnrcRegistration(reqUpdate).subscribe(
      (res: any) => {
        this.isSubmitting = false
        this.logger.log("test", res)
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
              message: 'कृपया ई-क्षमता ऐप डाउनलोड करें और दिए गए मोबाइल नंबर के साथ ओटीपी का उपयोग करके लॉगिन करें । Kindly download the e- Kshamata app and login using your given mobile number with OTP.', from: 'Bnrc',
            },
          })
        } else {
          this.logger.log('Form is valid. Saving data...', res)

          this.loader.changeLoad.next(false)
          this.openSnackbar(res.message)

        }
      },
      error => {
        this.isSubmitting = false
        this.logger.error('HTTP Error:', error.error.message)

        this.loader.changeLoad.next(false)
        this.openSnackbar(error.error.message)

      }
    )
  }
  public openSnackbar(primaryMsg: string, duration = 10000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

}

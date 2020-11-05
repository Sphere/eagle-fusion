import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core'
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { Observable, of, timer, throwError, noop, Subscription } from 'rxjs'
import { finalize, startWith, map, switchMap, catchError } from 'rxjs/operators'

import { NsContent } from '@ws-widget/collection'
import { TFetchStatus, TSendStatus } from '@ws-widget/utils'

import {
  ICertificationMeta,
  ICertificationCountry,
  IAtDeskLocation,
  IAtDeskSlotItem,
  ICertificationSendResponse,
  ICertificationDate,
  ICertificationUserPrivileges,
} from '../../models/certification.model'
import { CertificationApiService } from '../../apis/certification-api.service'
import { CertificationService } from '../../services/certification.service'
import { Router, ActivatedRoute } from '@angular/router'
import { SnackbarComponent } from '../snackbar/snackbar.component'

@Component({
  selector: 'ws-app-at-desk-slot-booking',
  templateUrl: './at-desk-slot-booking.component.html',
  styleUrls: ['./at-desk-slot-booking.component.scss'],
})
export class AtDeskSlotBookingComponent implements OnInit, OnDestroy {
  content!: NsContent.IContent
  certification!: ICertificationMeta
  @ViewChild('countryInput', { static: true }) countryInput!: ElementRef<HTMLInputElement>

  atDeskSlotItems!: IAtDeskSlotItem[]
  countries!: ICertificationCountry[]
  locations!: IAtDeskLocation[]
  filteredCountries$!: Observable<ICertificationCountry[]>
  countriesChipList: ICertificationCountry[]
  countryCtrl: FormControl = new FormControl()
  dateSlotMap: Map<string, IAtDeskSlotItem> = new Map()
  slotList: { dateStr: string; dateObj: ICertificationDate }[]
  selectedDateSlotItem!: IAtDeskSlotItem
  userPrivileges?: ICertificationUserPrivileges

  managerFetchStatus: TFetchStatus
  requestSendStatus: TSendStatus

  certificationMetaSub?: Subscription
  contentMetaSub?: Subscription

  atDeskForm: FormGroup

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private certificationApi: CertificationApiService,
    private certificationSvc: CertificationService,
  ) {
    this.atDeskForm = new FormGroup({
      date: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
      location: new FormControl(null, [Validators.required]),
      slot: new FormControl(null, [Validators.required]),
      userContact: new FormControl(null, [Validators.required]),
      proctorContact: new FormControl(null, [Validators.required]),
      proctorEmail: new FormControl('', [], [this.validateProctorEmail.bind(this)]),
    })

    this.managerFetchStatus = 'none'
    this.requestSendStatus = 'none'

    this.countriesChipList = []
    this.slotList = []
  }

  ngOnInit() {
    this.subscribeToContentResolve()
    this.subscribeToCertificationResolve()

    this.certificationApi.getAtDeskSlots().subscribe(slotData => {
      this.atDeskSlotItems = slotData

      slotData.forEach(slotObj => {
        const dateStr = this.getStringifiedDates(slotObj.date)
        this.dateSlotMap.set(dateStr, slotObj)
        this.slotList.push({ dateStr, dateObj: slotObj.date })
      })
    })

    this.certificationApi
      .getCountries()
      .pipe(
        finalize(() => {
          this.filteredCountries$ = this.countryCtrl.valueChanges.pipe(
            startWith(''),
            map(countryName => this.filterCountries(countryName)),
          )
        }),
      )
      .subscribe(
        countries => {
          this.countries = countries
        },
        () => {
          this.countries = []
        },
      )

    this.getUserManager()
  }

  ngOnDestroy() {
    if (this.contentMetaSub && !this.contentMetaSub.closed) {
      this.contentMetaSub.unsubscribe()
    }

    if (this.certificationMetaSub && !this.certificationMetaSub.closed) {
      this.certificationMetaSub.unsubscribe()
    }
  }

  displayCountryNameAutocomplete(country?: ICertificationCountry) {
    return country ? country.country_name : undefined
  }

  countrySelected(country: ICertificationCountry) {
    if (this.countriesChipList.length) {
      return
    }

    this.countriesChipList.push(country)
    this.countryInput.nativeElement.value = ''
    this.countryInput.nativeElement.readOnly = true
    this.atDeskForm.patchValue({
      country: country.country_code,
    })
    this.locations = []

    this.certificationApi.getAtDeskLocations(country.country_code).subscribe(atDeskLocations => {
      this.locations = atDeskLocations
    })
  }

  countryRemoved() {
    this.countriesChipList = []
    this.atDeskForm.patchValue({
      country: null,
      location: null,
    })
    this.countryInput.nativeElement.value = ''
    this.countryInput.nativeElement.readOnly = false
    this.locations = []
  }

  filterDates = (date: Date): boolean => {
    try {
      return this.dateSlotMap.has(date.toString())
    } catch (e) {
      return false
    }
  }

  onDateChange(date: { dateStr: string; dateObj: ICertificationDate }) {
    const slotItem = this.dateSlotMap.get(date.dateStr)
    if (slotItem) {
      this.selectedDateSlotItem = slotItem
    }
  }

  onSubmit() {
    if (this.content) {
      if (this.atDeskForm.invalid) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            action: 'cert_at_desk_send',
            code: 'form_invalid',
          },
        })
        return
      }

      this.requestSendStatus = 'sending'
      this.certificationSvc.bookAtDeskSlot(this.content.identifier, this.atDeskForm).subscribe(
        (res: ICertificationSendResponse) => {
          this.requestSendStatus = 'done'
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              action: 'cert_at_desk_send',
              code: res.res_code,
            },
          })

          if (res.res_code === 1) {
            const url = this.content ? `/app/toc/${this.content.identifier}/certification` : '/'
            this.router.navigate([url])
          }
        },
        () => {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              action: 'cert_at_desk_send',
              code: '',
            },
          })
          this.requestSendStatus = 'error'
        },
      )
    }
  }

  validateProctorEmail(control: AbstractControl): Observable<ValidationErrors | null> {
    return timer(500).pipe(
      map(() => control.value),
      switchMap((value: string) => {
        if (!value) {
          return throwError({ invalidEmail: true })
        }

        const trimmedEmail = value.split('@')[0]

        if (
          this.userPrivileges &&
          trimmedEmail.toLowerCase() === this.userPrivileges.manager.toLowerCase()
        ) {
          return of(null)
        }

        return this.certificationApi.getCertificationUserPrivileges(trimmedEmail)
      }),
      map(privileges =>
        privileges === null ? null : privileges.canProctorAtDesk ? null : { invalidEmail: true },
      ),
      catchError(() => of({ invalidEmail: true })),
    )
  }

  private getUserManager() {
    this.managerFetchStatus = 'fetching'
    this.certificationApi.getDefaultAtDeskProctor().subscribe(privileges => {
      this.userPrivileges = privileges
      this.atDeskForm.patchValue({
        proctorEmail: this.userPrivileges.manager,
      })
      this.managerFetchStatus = 'done'
    },                                                        noop)
  }

  private filterCountries(value: string): ICertificationCountry[] {
    if (typeof value !== 'string') {
      return []
    }

    const filterValue = value.toLowerCase()
    return this.countries.filter(country =>
      country.country_name.toLowerCase().includes(filterValue),
    )
  }

  private getStringifiedDates(dateObj: ICertificationDate) {
    let dateStr = `${dateObj.day}/${dateObj.month}/${dateObj.year}`
    if (dateObj.timeZone) {
      dateStr += ` ${dateObj.timeZone}`
    }

    return dateStr
  }

  private subscribeToCertificationResolve() {
    this.certificationMetaSub = this.certificationSvc
      .getCertificationMeta(this.route.parent)
      .subscribe(certificationData => {
        this.certification = certificationData
      },         noop)
  }

  private subscribeToContentResolve() {
    this.contentMetaSub = this.certificationSvc
      .getContentMeta(this.route.parent)
      .subscribe(content => {
        this.content = content
      },         noop)
  }
}

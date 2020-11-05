import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { Observable, Subscription } from 'rxjs'
import { finalize, startWith, map, tap, switchMap } from 'rxjs/operators'

import { NsContent } from '@ws-widget/collection'
import { TFetchStatus, TSendStatus } from '@ws-widget/utils'

import {
  IAccLocation,
  ITestCenterSlotList,
  ITestCenterSlot,
  ICertificationMeta,
} from '../../models/certification.model'
import { CertificationApiService } from '../../apis/certification-api.service'
import { CertificationService } from '../../services/certification.service'
import { ActivatedRoute, Router } from '@angular/router'
import { SnackbarComponent } from '../snackbar/snackbar.component'

@Component({
  selector: 'ws-app-acc-slot-booking',
  templateUrl: './acc-slot-booking.component.html',
  styleUrls: ['./acc-slot-booking.component.scss'],
})
export class AccSlotBookingComponent implements OnInit {
  content?: NsContent.IContent
  certification?: ICertificationMeta
  @ViewChild('locationInput', { static: false }) locationInput!: ElementRef<
    HTMLInputElement
  >

  accForm: FormGroup
  locations!: IAccLocation[]
  locationChipList: IAccLocation[]
  filteredLocations$!: Observable<IAccLocation[]>
  locationCtrl: FormControl
  slots?: ITestCenterSlotList | null
  dateSlotMap: Map<number, ITestCenterSlot[]>
  fetchStatus: TFetchStatus
  locationFetchStatus: TFetchStatus
  dateSlotFetchStatus: TFetchStatus
  bookingSendStatus: TSendStatus
  certificationMetaSub?: Subscription
  contentMetaSub?: Subscription

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private certificationApi: CertificationApiService,
    private certificationSvc: CertificationService,
  ) {
    this.locationChipList = []
    this.locationCtrl = new FormControl()
    this.dateSlotMap = new Map<number, ITestCenterSlot[]>()

    this.accForm = new FormGroup({
      dc: new FormControl(null, [Validators.required]),
      testCenter: new FormControl(null, [Validators.required]),
      dateSlot: new FormControl(null, [Validators.required]),
      slot: new FormControl(null, [Validators.required]),
    })

    this.fetchStatus = 'none'
    this.locationFetchStatus = 'fetching'
    this.dateSlotFetchStatus = 'none'
    this.bookingSendStatus = 'none'
  }

  ngOnInit() {
    this.subscribeToCertificationResolve()
    this.subscribeToContentResolve()
  }

  displayLocationNameAutocomplete(location?: IAccLocation) {
    return location ? location.dc : undefined
  }

  locationSelected(location: IAccLocation) {
    if (this.locationChipList.length) {
      return
    }

    this.locationChipList.push(location)
    this.locationInput.nativeElement.value = ''
    this.locationInput.nativeElement.readOnly = true
    this.accForm.patchValue({
      dc: location.dc,
    })
  }

  locationRemoved() {
    this.locationChipList = []
    this.accForm.patchValue({
      dc: null,
      testCenter: null,
      dateSlot: null,
      slot: null,
    })
    this.slots = null
    this.locationInput.nativeElement.value = ''
    this.locationInput.nativeElement.readOnly = false
    this.locationCtrl.patchValue(null)
  }

  getTestCenterSlots() {
    this.accForm.patchValue({
      dateSlot: null,
      slot: null,
    })

    if (this.content) {
      this.dateSlotFetchStatus = 'fetching'

      this.certificationApi
        .getTestCenterSlots(
          this.content.identifier,
          this.accForm.value.dc,
          this.accForm.value.testCenter,
        )
        .subscribe(
          slotData => {
            this.slots = slotData
            this.dateSlotFetchStatus = 'done'
          },
          () => {
            this.slots = {
              dc: this.accForm.value.dc,
              testcenter: this.accForm.value.testCenter,
              slotdata: [],
            }
            this.dateSlotFetchStatus = 'error'
          },
        )
    }
  }

  onDateChange() {
    this.accForm.patchValue({
      slot: null,
    })
  }

  onSubmit() {
    if (this.content) {
      this.bookingSendStatus = 'sending'

      if (this.accForm.invalid) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            action: 'cert_acc_send',
            code: 'form_invalid',
          },
        })

        return
      }

      this.certificationApi
        .bookAccSlot(this.content.identifier, this.accForm.value.slot)
        .subscribe(
          res => {
            this.bookingSendStatus = 'done'

            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                action: 'cert_acc_send',
                code: res.res_code,
              },
            })

            if (res.res_code === 1) {
              this.router.navigate([
                `/app/toc/${
                  this.content ? this.content.identifier : ''
                }/certification`,
              ])
            }
          },
          () => {
            this.bookingSendStatus = 'error'
          },
        )
    }
  }

  filterDates = (date: Date): boolean => {
    try {
      return this.dateSlotMap.has(date.getTime())
    } catch (e) {
      return false
    }
  }

  dateHasSlots(dateSlot: { date: number; slots: ITestCenterSlot[] }): boolean {
    try {
      let hasSlots = false
      dateSlot.slots.forEach(slot => {
        hasSlots = hasSlots || slot.seats_available
      })
      return hasSlots
    } catch (err) {
      return true
    }
  }

  private filterLocations(value: string): IAccLocation[] {
    try {
      const filterValue = value.toLowerCase()
      return this.locations.filter(location =>
        location.dc.toLowerCase().includes(filterValue),
      )
    } catch (e) {
      return []
    }
  }

  private subscribeToCertificationResolve() {
    this.fetchStatus = 'fetching'
    this.certificationMetaSub = this.certificationSvc
      .getCertificationMeta(this.route)
      .subscribe(
        certificationData => {
          this.certification = certificationData
          this.fetchStatus = 'done'
        },
        () => {
          this.fetchStatus = 'error'
        },
      )
  }

  private subscribeToContentResolve() {
    this.contentMetaSub = this.certificationSvc
      .getContentMeta(this.route.parent)
      .pipe(
        tap(content => {
          this.content = content
        }),
        switchMap(content =>
          this.certificationApi.getTestCenters(content.identifier),
        ),
        finalize(() => {
          this.filteredLocations$ = this.locationCtrl.valueChanges.pipe(
            startWith(''),
            map(location => this.filterLocations(location)),
          )
        }),
      )
      .subscribe(
        locations => {
          this.locations = locations
          this.locationFetchStatus = 'done'
          if (this.contentMetaSub) {
            this.contentMetaSub.unsubscribe()
          }
        },
        () => {
          this.locations = []
          this.locationFetchStatus = 'error'
        },
      )
  }
}

import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core'
import moment from 'moment'
import { Observable } from 'rxjs'
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../project/ws/app/src/lib/routes/user-profile/services/format-datepicker'
import { LoggerService } from '@ws-widget/utils'

@Component({
    standalone: false,
    selector: 'ws-your-location',
    templateUrl: './your-location.component.html',
    styleUrls: ['./your-location.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    ],
    
})
export class YourLocationComponent implements OnInit {
  disticts: any
  countries: any
  states: any
  dob: any
  districtArr: any
  selectDisable = true
  yourBackground = false
  aboutYouForm: UntypedFormGroup
  // maxDate = new Date()
  // minDate = new Date(1900, 1, 1)
  invalidDob = false
  nextBtnDisable = true
  filteredOptionsDistrict: Observable<string[]> | undefined
  countryUrl = '../../../fusion-assets/files/country.json'
  districtUrl = '../../../fusion-assets/files/district.json'
  stateUrl = '../../../fusion-assets/files/state.json'
  startDate = new Date(1999, 0, 1)

  constructor(
    private readonly http: HttpClient,
    private readonly logger: LoggerService
  ) {
    this.aboutYouForm = new UntypedFormGroup({
      dob: new UntypedFormControl(),
      country: new UntypedFormControl(),
      distict: new UntypedFormControl(),
      state: new UntypedFormControl(),
      countryCode: new UntypedFormControl(),
    })
  }

  ngOnInit() {
    this.fetchMeta()
  }

  fetchMeta() {
    this.http.get(this.countryUrl).subscribe((data: any) => {
      this.countries = data.nationalities
    })
  }
  countrySelect(event: any) {
    this.logger.log(this.aboutYouForm.controls)
    const value = event.value
    this.setCountryCode(value)
    if (value === 'India') {
      this.http.get(this.stateUrl).subscribe((data: any) => {
        this.states = data.states
      })
      this.selectDisable = false
    } else {
      this.selectDisable = true
      this.aboutYouForm.controls.state.setValue(null)
      this.aboutYouForm.controls.distict.setValue(null)
    }
    this.disableNextBtn()
  }
  setCountryCode(country: string) {
    const selectedCountry = this.countries.filter((e: any) => e.name.toLowerCase() === country.toLowerCase())
    this.aboutYouForm.controls.countryCode.setValue(selectedCountry[0].countryCode)
  }
  onDateChange(event: any) {
    const customerDate = moment(event)
    const dateNow = moment(new Date())
    const duration = moment.duration(dateNow.diff(customerDate))
    if (duration.asYears() > 18) {
      this.invalidDob = false
    } else {
      this.invalidDob = true
    }
  }
  disableNextBtn() {
    this.logger.log(this.aboutYouForm.controls)
    if (this.aboutYouForm.controls.dob.value && this.aboutYouForm.controls.country.value) {
      if (this.aboutYouForm.controls.country.value !== 'India') {
        this.nextBtnDisable = false
      } else if (this.aboutYouForm.controls.country.value === 'India') {
        if (this.aboutYouForm.controls.state.value && this.aboutYouForm.controls.distict.value) {
          this.nextBtnDisable = false
        } else {
          this.nextBtnDisable = true
        }
      } else {
        this.nextBtnDisable = false
      }
    } else {
      this.nextBtnDisable = true
    }
  }

  stateSelect(event: any) {
    const value = event.value
    this.http.get(this.districtUrl).subscribe((statesdata: any) => {
      statesdata.states.forEach((item: any) => {
        if (item.state === value) {
          this.disticts = item.districts
        }
      })
    })
    this.disableNextBtn()
  }

  onsubmit() {
    // form.value.dob = moment(form.value.dob).format('DD-MM-YYYY')
    this.yourBackground = true
  }

  dobData(event: any) {
    this.logger.log(event)
    this.logger.log(this.aboutYouForm.controls)
    this.aboutYouForm.patchValue({
      dob: event,
    })
    this.disableNextBtn()
  }
}

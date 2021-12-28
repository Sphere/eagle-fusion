import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

@Component({
  selector: 'ws-your-location',
  templateUrl: './your-location.component.html',
  styleUrls: ['./your-location.component.scss'],
})
export class YourLocationComponent implements OnInit {
  districts: any
  countries: any
  states: any
  yourLocationForm: FormGroup
  countryUrl = '../../../fusion-assets/files/country.json'
  districtUrl = '../../../fusion-assets/files/district.json'
  stateUrl = '../../../fusion-assets/files/state.json'

  constructor(
    private http: HttpClient
  ) {
    this.yourLocationForm = new FormGroup({
      distict: new FormControl(this.districts),
      country: new FormControl(this.countries),
      state: new FormControl(this.states),
    })
  }

  ngOnInit() {
    this.fetchMeta()
  }

  fetchMeta() {
    this.http.get(this.countryUrl).subscribe((data: any) => {
      this.countries = data.nationalities
    })

    this.http.get(this.stateUrl).subscribe((data: any) => {
      this.states = data.states
    })

    this.http.get(this.districtUrl).subscribe((data: any) => {
      this.districts = data.states
    })
  }
  onSubmit() {

  }

}

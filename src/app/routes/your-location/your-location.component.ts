// import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

@Component({
  selector: 'ws-your-location',
  templateUrl: './your-location.component.html',
  styleUrls: ['./your-location.component.scss'],
})
export class YourLocationComponent implements OnInit {
  districts = ['Distict/City']
  countries = ['Country']
  states = ['States']
  yourLocationForm: FormGroup

  constructor() {
    this.yourLocationForm = new FormGroup({
      distict: new FormControl(this.districts),
      country: new FormControl(this.countries),
      state: new FormControl(this.states),
    })
  }

  ngOnInit() {
    // this.http.get('../../../fusion-assets/files/district.json').subscribe((data: any) => {
    //   this.districts = data.states
    //   console.log(this.districts)
    // })
  }

}

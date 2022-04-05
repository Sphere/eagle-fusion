import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import moment from 'moment'

@Component({
  selector: 'ws-work-info-edit',
  templateUrl: './work-info-edit.component.html',
  styleUrls: ['./work-info-edit.component.scss']
})
export class WorkInfoEditComponent implements OnInit {
  maxDate = new Date()
  minDate = new Date(1900, 1, 1)
  invalidDoj = false
  workInfoForm: FormGroup

  constructor() {
    this.workInfoForm = new FormGroup({
      doj: new FormControl(),
      organizationName: new FormControl(),
      designation: new FormControl(),
      location: new FormControl()
    })
  }

  ngOnInit() {
  }

  onDateChange(event: any) {
    const customerDate = moment(event)
    const dateNow = moment(new Date())
    const duration = moment.duration(dateNow.diff(customerDate))
    if (duration.asYears() > 18) {
      this.invalidDoj = false
    } else {
      this.invalidDoj = true
    }
  }

}

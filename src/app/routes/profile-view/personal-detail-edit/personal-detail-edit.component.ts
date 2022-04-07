import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import moment from 'moment'

@Component({
  selector: 'ws-personal-detail-edit',
  templateUrl: './personal-detail-edit.component.html',
  styleUrls: ['./personal-detail-edit.component.scss'],
})
export class PersonalDetailEditComponent implements OnInit {
  maxDate = new Date()
  minDate = new Date(1900, 1, 1)
  invalidDob = false
  personalDetailForm: FormGroup
  professions = ['Healthcare Worker', 'Healthcare Volunteer', 'Mother/Family Member', 'Student', 'Faculty', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']

  constructor() {
    this.personalDetailForm = new FormGroup({
      userName: new FormControl(),
      dob: new FormControl(),
      profession: new FormControl(),
      rnNumber: new FormControl(),
      org: new FormControl(),
      organizationName: new FormControl(),
      nationality: new FormControl(),
      motherTounge: new FormControl(),
      gender: new FormControl(),
      maritalStatus: new FormControl(),
      languages: new FormControl(),
      phoneNumber: new FormControl(),
      address: new FormControl(),
      pincode: new FormControl(),
    })
  }

  ngOnInit() {
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

  onSubmit() {

  }

}

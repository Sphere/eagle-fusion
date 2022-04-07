import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

@Component({
  selector: 'ws-education-edit',
  templateUrl: './education-edit.component.html',
  styleUrls: ['./education-edit.component.scss'],
})
export class EducationEditComponent implements OnInit {
  educationForm: FormGroup

  constructor() {
    this.educationForm = new FormGroup({
      courseDegree: new FormControl(),
      courseName: new FormControl(),
      institutionName: new FormControl(),
      yearPassing: new FormControl(),
    })
  }

  ngOnInit() {
  }

}

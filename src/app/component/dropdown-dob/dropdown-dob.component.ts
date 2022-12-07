import { Component, EventEmitter, OnInit, Output, Input, AfterViewInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'

@Component({
  selector: 'ws-dropdown-dob',
  templateUrl: './dropdown-dob.component.html',
  styleUrls: ['./dropdown-dob.component.scss'],
})
export class DropdownDobComponent implements OnInit, AfterViewInit {

  @Output() dobValue = new EventEmitter<any>()
  @Input() dob?: Date
  dobForm: FormGroup

  dateValue = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
  monthValue = [{ id: 1, name: 'January' },
  { id: 2, name: 'February' },
  { id: 3, name: 'March' },
  { id: 4, name: 'April' },
  { id: 5, name: 'May' },
  { id: 6, name: 'June' },
  { id: 7, name: 'July' },
  { id: 8, name: 'August' },
  { id: 9, name: 'September' },
  { id: 10, name: 'October' },
  { id: 11, name: 'November' },
  { id: 12, name: 'December' },
  ]

  yearsValue: number[] = []
  constructor() {
    this.initYear()
    this.dobForm = new FormGroup({
      dateField: new FormControl('', Validators.required),
      monthField: new FormControl('', Validators.required),
      yearField: new FormControl('', Validators.required),
    })
  }
  ngAfterViewInit(): void {
    this.updateForm()
  }

  ngOnInit() {
  }
  /* function to update the form if input is there*/
  updateForm(): void {
    if (this.dob) {
      this.dobForm.patchValue({
        dateField: this.dob.getDate(),
        monthField: this.dob.getMonth() as number + 1,
        yearField: this.dob.getFullYear()
      })
    }
  }

  countrySelect() {
    if (this.dobForm.value.dateField && this.dobForm.value.monthField && this.dobForm.value.yearField) {
      const dob = `${this.dobForm.value.dateField}-${this.dobForm.value.monthField}-${this.dobForm.value.yearField}`
      this.dobValue.emit(dob)
    }
  }

  initYear() {
    const d = new Date()
    for (let i: number = (d.getFullYear() - 18); i > (d.getFullYear() - 100); i -= 1) {
      this.yearsValue.push(i)
    }

  }

}

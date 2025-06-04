import { Component, EventEmitter, OnInit, Output, Input, ChangeDetectorRef } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'

@Component({
  selector: 'ws-dropdown-dob',
  templateUrl: './dropdown-dob.component.html',
  styleUrls: ['./dropdown-dob.component.scss'],
})
export class DropdownDobComponent implements OnInit {
  @Output() dobValue = new EventEmitter<string>();
  @Input() dob?: string
  @Input() isEkshamata: boolean = false

  dobForm: UntypedFormGroup
  dateValue: number[] = [];
  monthValue = [
    { id: 1, name: 'January' }, { id: 2, name: 'February' },
    { id: 3, name: 'March' }, { id: 4, name: 'April' },
    { id: 5, name: 'May' }, { id: 6, name: 'June' },
    { id: 7, name: 'July' }, { id: 8, name: 'August' },
    { id: 9, name: 'September' }, { id: 10, name: 'October' },
    { id: 11, name: 'November' }, { id: 12, name: 'December' },
  ];
  yearsValue: number[] = [];

  constructor(public cdr: ChangeDetectorRef) {
    this.initYear()
    this.dobForm = new UntypedFormGroup({
      dateField: new UntypedFormControl('', Validators.required),
      monthField: new UntypedFormControl('', Validators.required),
      yearField: new UntypedFormControl('', Validators.required),
    })

    this.dobForm.get('monthField')!.valueChanges.subscribe(month => this.updateDays(month))
    this.dobForm.get('yearField')!.valueChanges.subscribe(() => {
      const month = this.dobForm.get('monthField')!.value
      if (month) this.updateDays(month)
    })

  }

  ngOnInit() {
    setTimeout(() => {
      this.updateForm()
    }, 500)
    if (this.isEkshamata) {
      this.dobForm.disable()
    }
  }

  updateForm(): void {
    if (this.dob) {
      const [day, month, year] = this.dob.split('/').map(Number)
      this.dobForm.patchValue({
        dateField: day,
        monthField: month,
        yearField: year,
      })
      this.updateDays(month) // Update days on initialization if dob is provided
    }
  }

  updateDays(month: number) {
    const year = this.dobForm.get('yearField')!.value
    const daysInMonth = new Date(year || 2020, month, 0).getDate()
    this.dateValue = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    // Reset date if current value exceeds the new number of days
    if (this.dobForm.get('dateField')!.value > daysInMonth) {
      this.dobForm.patchValue({ dateField: '' })
    }
  }

  countrySelect() {
    if (this.dobForm.valid) {
      const dob = `${this.dobForm.value.dateField}/${this.dobForm.value.monthField}/${this.dobForm.value.yearField}`
      this.dobValue.emit(dob)
    }
  }

  initYear() {
    const currentYear = new Date().getFullYear()
    for (let i = currentYear - 18; i > currentYear - 100; i--) {
      this.yearsValue.push(i)
    }
  }
}

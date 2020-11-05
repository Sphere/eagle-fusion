import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ENTER, COMMA, SEMICOLON } from '@angular/cdk/keycodes'
import { MatChipInputEvent } from '@angular/material'

interface IUserShareId {
  email: string
  color: string
  suffix: string
}

@Component({
  selector: 'ws-widget-email-input',
  templateUrl: './email-input.component.html',
  styleUrls: ['./email-input.component.scss'],
})
export class EmailInputComponent implements OnInit {

  @Input()
  defaultDomain = 'ad.wingspan.com' // TODO: read this from instance config

  @Output()
  change = new EventEmitter<string[]>()

  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON]
  userEmailIds: IUserShareId[] = []

  // TODO: read this from instance config
  validDomains: string[] = ['ad.wingspan.com', 'demo.com']

  errorType: 'no-domain' | 'invalid-domain' | 'none' = 'none'

  constructor() { }

  ngOnInit() { }

  addAll(event: MatChipInputEvent) {
    const input = event.input
    event.value.split(/[,;]+/).map((val: string) => val.trim()).forEach((value: string) => this.add(value))
    input.value = ''
    this.change.emit(this.userEmailIds.map(id => id.email))
  }

  remove(user: IUserShareId): void {
    const index = this.userEmailIds.indexOf(user)
    if (index >= 0) {
      this.userEmailIds.splice(index, 1)
    }
  }

  private add(value: string) {
    if (value) {
      const indexOfAt = value.indexOf('@')
      let suffix = ''
      let email = value
      if (indexOfAt > -1) {
        suffix = value.substring(indexOfAt + 1)
      } else {
        suffix = this.defaultDomain
        email += `@${this.defaultDomain}`
      }

      if (this.validDomains.includes(suffix)) {
        this.errorType = 'none'
        this.userEmailIds.push({
          email,
          suffix,
          color: 'primary',
        })
      } else if (suffix === '') {
        this.errorType = 'no-domain'
      } else {
        this.errorType = 'invalid-domain'
      }
    }
  }

}

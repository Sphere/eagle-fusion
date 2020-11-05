import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core'
import { UserAutocompleteService } from './user-autocomplete.service'
import { ENTER, COMMA } from '@angular/cdk/keycodes'
import { FormControl } from '@angular/forms'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { MatAutocompleteSelectedEvent, MatSnackBar } from '@angular/material'
import { debounceTime, distinctUntilChanged, switchMap, catchError, filter } from 'rxjs/operators'
import { NsAutoComplete } from './user-autocomplete.model'
import { of } from 'rxjs'

@Component({
  selector: 'ws-widget-user-autocomplete',
  templateUrl: './user-autocomplete.component.html',
  styleUrls: ['./user-autocomplete.component.scss'],
})
export class UserAutocompleteComponent implements OnInit {

  separatorKeysCodes: number[] = [ENTER, COMMA]
  userFormControl = new FormControl()
  selectedUsers: NsAutoComplete.IUserAutoComplete[] = []
  autocompleteAllUsers: NsAutoComplete.IUserAutoComplete[] = []
  tagsFromConversation = []
  fetchTagsStatus: TFetchStatus | undefined
  userId = ''

  @Input() allowSelfAutocomplete = false
  @ViewChild('userInputForm', { static: true }) userInputFormRef!: ElementRef<HTMLInputElement>
  @Output() usersList = new EventEmitter<NsAutoComplete.IUserAutoComplete[]>()
  @Output() addedUser = new EventEmitter<NsAutoComplete.IUserAutoComplete>()
  @Output() removedUser = new EventEmitter<NsAutoComplete.IUserAutoComplete>()
  constructor(
    private matSnackBar: MatSnackBar,
    private userAutocompleteSvc: UserAutocompleteService,
    private configSvc: ConfigurationsService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId
    }
    this.userFormControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.autocompleteAllUsers = []
            this.fetchTagsStatus = 'fetching'
            return this.userAutocompleteSvc.fetchAutoComplete(value).pipe(catchError(_ => of([])))
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.autocompleteAllUsers = users || []
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'error'
        },
      )
  }

  ngOnInit() { }

  removeUser(user: NsAutoComplete.IUserAutoComplete): void {
    const index = this.selectedUsers.findIndex(selectedUser => selectedUser.wid === user.wid)
    if (index >= 0) {
      this.removedUser.emit(this.selectedUsers[index])
      this.selectedUsers.splice(index, 1)
    }
    this.usersList.emit(this.selectedUsers)
  }

  selectUser(event: MatAutocompleteSelectedEvent, duplicateMsg: string, selfShareMsg: string): void {
    const selectedWid = (event.option.value.wid || '').trim()
    if (selectedWid === this.userId && !this.allowSelfAutocomplete) {
      this.openSnackBar(selfShareMsg)
      return
    }
    const userIndex = this.selectedUsers.findIndex(user => (user.wid === selectedWid))
    if (userIndex < 0) {
      this.selectedUsers.push(event.option.value)
      this.addedUser.emit(event.option.value)
    } else {
      this.openSnackBar(duplicateMsg)
    }
    this.usersList.emit(this.selectedUsers)
    this.userInputFormRef.nativeElement.value = ''
    this.userFormControl.setValue(null)
  }

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }
}

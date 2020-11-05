import { COMMA, ENTER } from '@angular/cdk/keycodes'
import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core'
import { MatChipInputEvent } from '@angular/material/chips'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { MatSnackBar } from '@angular/material'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { ISortEvent } from '../../../../../../../../../directives/draggable/sortable-list.directive'

@Component({
  selector: 'ws-auth-chips',
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.scss'],
})
export class ChipsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('copyText', { static: true }) copyText!: ElementRef<any>
  @ViewChild('class', { static: true }) class!: ElementRef
  @ViewChild('collection', { static: true }) collection!: ElementRef

  @Input() type: 'string' | 'array' = 'string'
  @Input() placeholderType = 'class'
  @Input() set content(data: any) {
    const value: string[] = data ? (this.type === 'string' ? data.split(' ') : data) : []
    this.value = value.filter((v: string) => (v || '').replace(/ /g, '').length > 0)
  }
  placeholder = ''
  value = [] as any
  @Output() data = new EventEmitter<string | string[]>()
  visible = true
  selectable = true
  removable = true
  addOnBlur = true
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]

  constructor(private snackBar: MatSnackBar, private cdk: ChangeDetectorRef) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.cdk.detach()
  }

  ngAfterViewInit() {
    if (this.placeholderType === 'class' && this.class) {
      this.placeholder = this.class.nativeElement.innerHTML
    } else if (this.placeholderType === 'collection' && this.collection) {
      this.placeholder = this.collection.nativeElement.innerHTML
    }
    this.cdk.detectChanges()
  }

  addAll(event: MatChipInputEvent) {
    const input = event.input
    event.value
      .split(/[,]+/)
      .map((val: string) => val.trim())
      .forEach((value: string) => this.add(value))
    input.value = ''
  }

  add(value: string): void {
    if (value) {
      if (this.value.indexOf(value) < 0) {
        this.value.push(value)
        this.data.emit(this.type === 'string' ? this.value.join(' ') : this.value)
      } else {
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.DUPLICTE,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      }
    }
  }

  remove(content: string): void {
    const index = this.value.indexOf(content)

    if (index >= 0) {
      this.value.splice(index, 1)
      this.data.emit(this.type === 'string' ? this.value.join(' ') : this.value)
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.value, event.previousIndex, event.currentIndex)
  }

  copyData() {
    const selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    selBox.value = this.value
    document.body.appendChild(selBox)
    selBox.focus()
    selBox.select()
    document.execCommand('copy')
    document.body.removeChild(selBox)
    this.snackBar.openFromComponent(NotificationComponent, {
      data: {
        type: Notify.COPY,
      },
      duration: NOTIFICATION_TIME * 1000,
    })
  }

  sort(event: ISortEvent) {
    const current = this.value[event.currentIndex]
    const swapWith = this.value[event.newIndex]
    this.value[event.newIndex] = current
    this.value[event.currentIndex] = swapWith
  }
}

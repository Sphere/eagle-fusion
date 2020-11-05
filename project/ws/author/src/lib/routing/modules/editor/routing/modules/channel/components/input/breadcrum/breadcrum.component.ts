import { IWidgetCardBreadcrumb } from '@ws-widget/collection/src/lib/card-breadcrumb/card-breadcrumb.model'
import { distinctUntilChanged, debounceTime } from 'rxjs/operators'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms'

@Component({
  selector: 'ws-auth-breadcrum',
  templateUrl: './breadcrum.component.html',
  styleUrls: ['./breadcrum.component.scss'],
})
export class BreadcrumComponent implements OnInit {

  form!: FormGroup
  @Input() isSubmitPressed = false
  @Input() content!: IWidgetCardBreadcrumb
  @Output() data = new EventEmitter<{ content: IWidgetCardBreadcrumb, isValid: boolean }>()

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      path: this.fb.array([]),
    })
    if (this.content && this.content.path && this.content.path.length) {
      this.content.path.map(path => {
        this.addPath(path.text, path.clickUrl)
      })
    } else {
      this.addPath('', '')
    }
    this.data.emit({ content: this.form.value, isValid: this.form.valid })
    this.form.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.data.emit({ content: this.form.value, isValid: this.form.valid })
    })
  }

  get path(): FormArray {
    return this.form.get('path') as FormArray
  }

  addPath(text: string, url: string) {
    this.path.push(this.fb.group({
      text: [text, Validators.required],
      clickUrl: [url],
    }))
  }

  remove(i: number) {
    this.path.removeAt(i)
  }

}

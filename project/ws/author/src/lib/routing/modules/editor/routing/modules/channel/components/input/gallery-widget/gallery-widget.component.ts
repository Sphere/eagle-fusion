import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { NsGalleryView } from '@ws-widget/collection/src/public-api'

@Component({
  selector: 'ws-auth-gallery-widget',
  templateUrl: './gallery-widget.component.html',
  styleUrls: ['./gallery-widget.component.scss'],
})
export class GalleryWidgetComponent implements OnInit {

  @Input() identifier = ''
  @Input() isSubmitPressed = false
  @Input() content!: NsGalleryView.IWidgetGalleryView
  @Output() data = new EventEmitter<{ content: NsGalleryView.IWidgetGalleryView, isValid: boolean }>()
  form!: FormGroup
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      designVal: [this.content ? this.content.designVal || 'set1' : 'set1', Validators.required],
      autoNext: [this.content.autoNext || false],
      delay: [this.content.delay || ''],
      loop: [this.content.loop || false],
      widgetPlayer: [this.content.configs ? this.content.configs.widgetPlayer || '' : ''],
      widgetRibbon: [this.content.configs ? this.content.configs.widgetRibbon || '' : ''],

    })
    this.form.valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
    ).subscribe({
      next: () => {
        this.data.emit({
          content: this.form.value,
          isValid: this.form.valid,
        })
      },
    })
  }

  update(key: string, data: any) {
    this.form.controls[key].setValue(data)
  }

  // update(key: string, value: boolean) {
  //   this.form.controls[key].setValue(value)
  // }

}

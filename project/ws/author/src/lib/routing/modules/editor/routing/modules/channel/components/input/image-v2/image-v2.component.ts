import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { IWidgetElementHtml } from '@ws-widget/collection'
import {
  AUTHORING_CONTENT_BASE,
  CONTENT_BASE_WEBHOST_ASSETS,
} from '@ws/author/src/lib/constants/apiEndpoints'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { NOTIFICATION_TIME } from '../../../../../../../../../constants/constant'
import { Notify } from '../../../../../../../../../constants/notificationMessage'
import { FILE_MAX_SIZE } from '../../../../../../../../../constants/upload'
import { NotificationComponent } from '../../../../../../../../../modules/shared/components/notification/notification.component'
import { TEMPLATE_TYPES } from './image-v2.constant'

@Component({
  selector: 'ws-auth-image-v2',
  templateUrl: './image-v2.component.html',
  styleUrls: ['./image-v2.component.scss'],
})
export class ImageV2Component implements OnChanges {
  @Output() data = new EventEmitter<{ content: IWidgetElementHtml; isValid: boolean }>()
  @Input() content!: IWidgetElementHtml
  @Input() identifier = ''
  @Input() isSubmitPressed = false
  @Input() size: 1 | 2 | 3 | 4 = 1
  minWidth = 331
  form!: FormGroup
  canShow: string[] = []
  previewCard: string[] = []

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private loader: LoaderService,
    private uploadService: UploadService,
  ) { }

  generateForm() {
    this.form = this.formBuilder.group({
      title: [],
      template: [],
      description: [],
      link: [],
      target: [],
      imageSrc: ['', Validators.required],
      type: [],
      category: [],
      width: [this.minWidth],
    })

    this.form.valueChanges.pipe(debounceTime(100), distinctUntilChanged()).subscribe({
      next: () => {
        this.content.type = this.form.value.type
        const widgetArray = (this.content.containerClass || '').split(' ')
        // if (!this.content.containerClass) {
        //   widgetArray.push('mat-elevation-z1')
        // } else if (this.content.containerClass.indexOf('mat-elevation-z1') < 0) {
        //   widgetArray.push('mat-elevation-z1')
        // }
        this.content.containerClass = widgetArray.join(' ')
        this.content.html = ''
        this.content.template = TEMPLATE_TYPES[this.form.value.type as keyof typeof TEMPLATE_TYPES]
        this.content.templateData = { ...this.form.value }
        delete this.content.templateData.type
        delete this.content.templateData.template
        // this.removeShadowFromTitle()
        this.data.emit({
          content: this.form.value,
          isValid: this.form.valid,
        })
      },
    })
    this.form.controls.type.valueChanges.subscribe(() => this.onSetChange())
  }

  ngOnChanges() {
    this.minWidth = 331 * this.size
    if (this.form) {
      this.form.reset()
    } else {
      this.generateForm()
    }
    const template = this.content.templateData || {}
    this.form.controls.title.setValue(template.title || '')
    this.form.controls.category.setValue(template.category || '')
    this.form.controls.template.setValue(this.content.template || '')
    this.form.controls.description.setValue(template.description || '')
    this.form.controls.link.setValue(template.link || '')
    this.form.controls.target.setValue(template.target || '_blank')
    this.form.controls.type.setValue(this.content.type || 'set1')
    this.form.controls.imageSrc.setValue(template.imageSrc || '')
    this.onSetChange()
  }

  onSetChange() {
    switch (this.form.controls.type.value) {
      case 'set1':
        this.canShow = ['image']
        break
      case 'set2':
        this.canShow = ['image', 'link']
        break
      case 'set3':
      case 'set5':
        this.canShow = ['image', 'name']
        break
      case 'set4':
      case 'set6':
        this.canShow = ['image', 'link', 'name']
        break
      case 'set7':
      case 'set9':
        this.canShow = ['image', 'name', 'description']
        break
      case 'set8':
      case 'set10':
        this.canShow = ['image', 'name', 'link', 'description']
        break
      case 'set11':
        this.canShow = ['image', 'name', 'category', 'description']
        break
      case 'set12':
        this.canShow = ['image', 'link', 'name', 'category', 'description']
        break
      case 'title':
        this.canShow = ['name']
        // this.addClass()
        break
      case 'text':
        this.canShow = ['name', 'description', 'link']
        break
      default:
        this.canShow = ['image']
    }
  }

  // addClass() {
  //   const widgetArray = (this.content.containerClass || '').split(' ')
  //   widgetArray.push('-mb-12')
  //   this.content.containerClass = widgetArray.join(' ')
  // }

  upload(file: File) {
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (!(file.type.indexOf('image/') > -1)) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.type.indexOf('image/') > -1 && file.size > FILE_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    formdata.append('content', file, fileName)
    this.loader.changeLoad.next(true)
    this.uploadService
      .upload(formdata, { contentId: this.identifier, contentType: CONTENT_BASE_WEBHOST_ASSETS })
      .subscribe(
        data => {
          if (data.code) {
            this.loader.changeLoad.next(false)
            this.form.controls.imageSrc.setValue(
              `${AUTHORING_CONTENT_BASE}${encodeURIComponent(
                `/${data.artifactURL
                  .split('/')
                  .slice(3)
                  .join('/')}`,
              )}`,
            )
            this.snackBar.openFromComponent(NotificationComponent, {
              data: {
                type: Notify.UPLOAD_SUCCESS,
              },
              duration: NOTIFICATION_TIME * 1000,
            })
          }
        },
        () => {
          this.loader.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.UPLOAD_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
  }

  onMatCardClick(index: number) {
    this.form.controls.type.setValue(`set${index}`)
  }

  addElevation() {
    if (this.content) {
      const widgetArray = (this.content.containerClass || '').split(' ')
      if (
        this.content.containerClass &&
        this.content.containerClass.indexOf('mat-elevation-z4') > -1
      ) {
        widgetArray.splice(widgetArray.indexOf('mat-elevation-z4'), 1)
      } else {
        widgetArray.push('mat-elevation-z4')
      }
      this.content.containerClass = widgetArray.join(' ')
    }
  }
}

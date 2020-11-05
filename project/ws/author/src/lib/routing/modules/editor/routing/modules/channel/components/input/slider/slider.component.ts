import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { FILE_MAX_SIZE } from '@ws/author/src/lib/constants/upload'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { CONTENT_BASE_WEBHOST_ASSETS, AUTHORING_CONTENT_BASE } from '@ws/author/src/lib/constants/apiEndpoints'
import { ICarousel } from '@ws-widget/collection/src/public-api'

@Component({
  selector: 'ws-auth-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit {

  @Input() identifier!: string
  @Input() content!: ICarousel[]
  @Input() isSubmitPressed = false
  @Output() data = new EventEmitter<{ content: ICarousel, isValid: Boolean }>()
  form!: FormGroup

  constructor(
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    public formBuilder: FormBuilder,
    public loader: LoaderService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      iCarousel: this.formBuilder.array([]),
    })
    if (this.content && this.content.length) {
      this.content.map(v => this.addImageDetailsToForm(v))
    } else {
      this.addImageDetailsToForm()
    }
    this.form.valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
    ).subscribe({
      next: () => {
        this.data.emit({
          content: this.form.value.iCarousel,
          isValid: this.form.valid,
        })
      },
    })
  }

  get paths(): any {
    return this.form.get('iCarousel') as FormArray
  }

  addImageDetailsToForm(data?: ICarousel) {
    this.paths.push(this.formBuilder.group({
      title: [data ? data.title || '' : '', Validators.required],
      redirectUrl: [data ? data.redirectUrl || '' : '', Validators.required],
      openInNewTab: [data ? data.openInNewTab || '_blank' : '_blank', Validators.required],
      banners: this.formBuilder.group({
        xs: [data && data.banners ? data.banners.xs || '' : '', Validators.required],
        s: [data && data.banners ? data.banners.s || '' : '', Validators.required],
        m: [data && data.banners ? data.banners.m || '' : '', Validators.required],
        l: [data && data.banners ? data.banners.l || '' : '', Validators.required],
        xl: [data && data.banners ? data.banners.xl || '' : '', Validators.required],
      }),
    }))
  }

  removeButtonClick(index: number) {
    this.paths.removeAt(index)
  }

  upload(file: File, index: number, type: string) {
    const formControl = (this.paths.at(index).get('banners') as FormGroup).get(type) as AbstractControl
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

    if ((file.type.indexOf('image/') > -1 && file.size > FILE_MAX_SIZE)) {
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
    this.uploadService.upload(
      formdata,
      { contentId: this.identifier, contentType: CONTENT_BASE_WEBHOST_ASSETS },
    ).subscribe(
      data => {
        if (data.code) {
          this.loader.changeLoad.next(false)
          formControl.setValue(`${AUTHORING_CONTENT_BASE}${encodeURIComponent(
            `/${data.artifactURL.split('/').slice(3).join('/')}`)}`)
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

}

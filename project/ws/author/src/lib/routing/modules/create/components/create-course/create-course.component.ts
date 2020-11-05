import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'
import { ICreateEntity } from '@ws/author/src/lib/interface/create-entity'
import { MatSnackBar, MatDialog } from '@angular/material'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { CreateService } from '../create/create.service'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { IprDialogComponent } from '@ws/author/src/lib/modules/shared/components/ipr-dialog/ipr-dialog.component'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ws-author-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss'],
})
export class CreateCourseComponent implements OnInit {
  @Input() content: any

  language = ''
  entity: ICreateEntity[] = []
  resourceEntity!: ICreateEntity
  courseData: any
  iprAccepted = false

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private svc: CreateService,
              private router: Router,
              private loaderService: LoaderService, private dialog: MatDialog,
              private authInitService: AuthInitService,
              private accessControlSvc: AccessControlService) { }
  createCourseForm: FormGroup | undefined
  ngOnInit() {
    this.createCourseForm = this.fb.group({
      courseName: new FormControl('', [Validators.required]),
      courseIntroduction: new FormControl('', [Validators.required]),
    })

    this.authInitService.creationEntity.forEach(v => {
      if (!v.parent && v.available) {
        if (v.id === 'resource') {
          this.resourceEntity = v
        } else {
          this.entity.push(v)
          if (this.entity[1]) {
            this.content = this.entity[1]
          }
        }
      }
    })

    this.loaderService.changeLoadState(false)
    // this.allLanguages = this.authInitService.ordinals.subTitles || []
    this.language = this.accessControlSvc.locale

    // const navigation = this.router.getCurrentNavigation()
    // if (navigation && navigation.extras && navigation.extras.state) {
    //   this.content = navigation.extras.state
    // }

  }

  contentClicked() {
    this.loaderService.changeLoad.next(true)
    if (this.courseData && this.courseData.courseName) {
    this.svc
      .create({
        contentType: this.content.contentType,
        mimeType: this.content.mimeType,
        locale: this.language,
        name: this.courseData.courseName,
        description: this.courseData.courseIntroduction,
        ...(this.content.additionalMeta || {}),
      })
      .subscribe(
        (id: string) => {
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.CONTENT_CREATE_SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.router.navigateByUrl(`/author/editor/${id}`, { state: this.courseData })
        },
        error => {
          if (error.status === 409) {
            this.dialog.open(ErrorParserComponent, {
              width: '80vw',
              height: '90vh',
              data: {
                errorFromBackendData: error.error,
              },
            })
          }
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.CONTENT_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
  }
  }

  showIpr() {
    const dialogRef = this.dialog.open(IprDialogComponent, {
      width: '70%',
      data: { iprAccept: this.iprAccepted },
    })
    dialogRef.afterClosed().subscribe(result => {
      this.iprAccepted = result
    })
  }

  iprChecked() {
    this.iprAccepted = !this.iprAccepted
  }

  onSubmit(form: any) {
    this.courseData = form.value
    this.contentClicked()
  }

  navigateTo(params: string) {
    if (params === 'features') {
      this.router.navigate(['/app/features'])
    }
  }
}

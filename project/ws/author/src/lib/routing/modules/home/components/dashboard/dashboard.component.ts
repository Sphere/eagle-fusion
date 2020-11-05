import { Router } from '@angular/router'
import { DashBoardService } from './dashboard.service'
import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Observable } from 'rxjs'
import { FormControl } from '@angular/forms'
import { map, startWith } from 'rxjs/operators'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import {
  REVIEW_ROLE,
  PUBLISH_ROLE,
  CREATE_ROLE,
  RESOURCE,
  KBOARD,
  CHANNEL,
} from '@ws/author/src/lib/constants/content-role'

@Component({
  selector: 'ws-auth-root-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public options = [
    // 'Create new course',
    // 'Create new program',
    // 'Create new resource',
    // 'Create new module',
    'Create content',
    // 'Create page',
  ]
  createControl = new FormControl()
  filteredOptions: Observable<string[]> = this.createControl.valueChanges.pipe(
    startWith(''),
    map(value => this.filter(value)),
  )

  constructor(
    private snackBar: MatSnackBar,
    private svc: DashBoardService,
    private router: Router,
    private loaderService: LoaderService,
    private accessService: AccessControlService,
  ) {}

  ngOnInit() {
    this.loaderService.changeLoadState(false)
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase()
    return this.options.filter(option => option.toLowerCase().includes(filterValue))
  }

  contentClicked(content: string) {
    let contentType = ''
    let mimeType = ''
    switch (content) {
      case 'url':
        contentType = 'Resource'
        mimeType = 'application/html'
        break
      case 'channel':
        contentType = 'Channel'
        mimeType = 'application/channel'
        break
      case 'kboard':
        contentType = 'Knowledge Board'
        mimeType = 'application/vnd.ekstep.content-collection'
        break
    }
    this.loaderService.changeLoad.next(true)
    this.svc.create({ contentType, mimeType }).subscribe(
      (id: string) => {
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.router.navigateByUrl(`/author/editor/${id}`)
      },
      () => {
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

  canShow(role: string, type = 'access'): boolean {
    if (type === 'access') {
      switch (role) {
        case 'review':
          return this.accessService.hasRole(REVIEW_ROLE)
        case 'publish':
          return this.accessService.hasRole(PUBLISH_ROLE)
        case 'author':
          return this.accessService.hasRole(CREATE_ROLE)
        default:
          return false
      }
    }
    switch (role) {
      case 'curate':
        return this.accessService.hasRole(RESOURCE)
      case 'kboard':
        return this.accessService.hasRole(KBOARD)
      case 'channel':
        return this.accessService.hasRole(CHANNEL)
      default:
        return false
    }
  }
}

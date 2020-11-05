import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { EventService } from '../../services/event.service'
import { MatDialog } from '@angular/material'
import { ViewUsersComponent } from './view-users/view-users.component'
import { IUserDetails } from '../../interfaces/user-details.model'
import { ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-auth-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss'],
})
export class ProfileDetailComponent implements OnInit, OnDestroy {
  data: any
  newdata: any
  links: string[] = []
  lines: string[] = []
  urls: string[] = []
  userDetailsData: IUserDetails[] = []
  sessionID = ''
  noOfCards = 5
  width = '35vw'
  screenSubscription: Subscription | null = null
  // speakerName: string | null = ''
  constructor(
    private activatedRoute: ActivatedRoute,
    private appEventSvc: EventService,
    private dialog: MatDialog,
    private valSvc: ValueService,
    private router: Router,
  ) {
    const navigation = this.router.getCurrentNavigation()
    if (navigation) {
      const extraData = navigation.extras.state as {
        sessionID: string
      }
      this.sessionID = extraData.sessionID
    }
  }

  ngOnInit() {
    this.screenSubscription = this.valSvc.isLtMedium$.subscribe(isLtSMed => {
      if (isLtSMed) {
        this.noOfCards = 4
        this.width = '80vw'
      } else {
        this.noOfCards = 5
        this.width = '35vw'
      }
    })
    this.appEventSvc.bannerisEnabled.next(false)
    if (this.activatedRoute.parent) {
      this.userDetailsData = []
      this.activatedRoute.parent.data.subscribe((data: any) => {
        if (this.sessionID) {
          this.data = data.eventdata.data.SessionCards.Sessions[this.sessionID]
          // user details
          // Object.keys(this.data.AttendeesList).forEach
          Object.keys(this.data.SessionDescription.Content4).forEach((links: string) => {
            if (links.includes('Link')) {
              this.links.push(this.data.SessionDescription.Content4[links])
            }
            if (links.includes('Line')) {
              this.lines.push(this.data.SessionDescription.Content4[links])
            }
          })
          Object.keys(this.data.SessionDescription.Content3).forEach((urls: string) => {
            this.urls.push(this.data.SessionDescription.Content3[urls])
          })
        }
      })
    }
  }

  ngOnDestroy() {
    if (this.screenSubscription) {
      this.screenSubscription.unsubscribe()
    }
  }

  openDialog() {
    this.dialog.open(ViewUsersComponent, {
      width: this.width,
      height: 'auto',
      data: {
        userArray: this.data.AttendeesList,
        noOfUser: this.data.Attendees,
      },
    })
  }
}

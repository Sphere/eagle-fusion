import { Component, OnInit, Input } from '@angular/core'
import { PersonProfileService } from '../../services/person-profile.service'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { IFollowDetails } from '../../person-profile.model'
import { Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
    standalone: false,
    selector: 'ws-app-view-followperson',
    templateUrl: './view-followperson.component.html',
    styleUrls: ['./view-followperson.component.scss'],
    
})
export class ViewFollowpersonComponent implements OnInit {
  @Input() wid = ''
  @Input() name = ''
  @Input() userFollows = false
  emailId = ''
  userName = ''
  firstName = ''
  userDetails: IFollowDetails | undefined
  isFollowAvailable = true
  statusFollowed: 'FOLLOWED' | 'NOT_FOLLOWED' | 'PENDING' = 'NOT_FOLLOWED'

  constructor(
    private personprofileSvc: PersonProfileService,
    private configSvc: ConfigurationsService,
    private router: Router,
    private matSnackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    if (this.wid) {
      this.fetchUserDetails()
    }
    if (this.userFollows) {
      this.statusFollowed = 'FOLLOWED'
    }
  }

  fetchUserDetails() {
    if (this.wid) {
      if (this.configSvc.userProfile) {
        if (this.wid === this.configSvc.userProfile.userId) {
          this.isFollowAvailable = false
        }
      }
      this.personprofileSvc.fetchdetails(this.wid).subscribe(
        (data: any) => {
          if (data) {
            this.assignDetails(data)
          }
        },
        () => {
          this.openSnackBar('Error while fetching details.')
        })
    }
  }
  assignDetails(data: IFollowDetails[]) {
    this.userDetails = data[0]
    this.emailId = data[0].email
    this.userName = `${data[0].first_name} ${data[0].last_name}`
  }

  proceedToProfile(wid: string) {
    this.router.navigateByUrl(`/app/person-profile?userId=${wid}`)
  }

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

}

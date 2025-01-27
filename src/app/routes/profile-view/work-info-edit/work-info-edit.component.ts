import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
// import * as _ from 'lodash'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core'
import { constructReq } from '../request-util'
import { AppDateAdapter, APP_DATE_FORMATS, changeformat } from '../../../../../project/ws/app/src/public-api'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/public-api'
import { locale } from 'moment'
@Component({
  selector: 'ws-work-info-edit',
  templateUrl: './work-info-edit.component.html',
  styleUrls: ['./work-info-edit.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
})
export class WorkInfoEditComponent implements OnInit, OnDestroy {
  maxDate = new Date()
  minDate = new Date(1900, 1, 1)
  workInfoForm: FormGroup
  userProfileData!: any
  userID = ''
  showbackButton = false
  showLogOutIcon = false
  workLog: any
  change: any
  userlang: any

  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private valueSvc: ValueService,
    private UserAgentResolverService: UserAgentResolverService,
    private contentSvc: WidgetContentService,
  ) {
    this.workInfoForm = new FormGroup({
      //doj: new FormControl('', [Validators.required]),
      organizationName: new FormControl('', [Validators.required]),
      designation: new FormControl('', [Validators.required]),
      // location: new FormControl('', [Validators.required]),
    })
    this.change = this.contentSvc.workMessage.subscribe(async (data: any) => {
      console.log(data, 'here')
      this.workLog = await data
      let check = sessionStorage.getItem('work')
      console.log(check)
      if (this.workLog) {
        this.getUserDetails()
      }
      console.log(this.workLog.edit)
    })
  }

  ngOnInit() {
    this.workLog = sessionStorage.getItem('work') || null
    this.getUserDetails()
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.showbackButton = true
      this.showLogOutIcon = false
      if (isXSmall) {
        this.showbackButton = true
        this.showLogOutIcon = false
      }
    })
  }

  updateForm() {
    if (this.userProfileData && this.userProfileData.professionalDetails && this.userProfileData.professionalDetails.length > 0) {
      const organisation = this.userProfileData.professionalDetails[0]
      this.workInfoForm.patchValue({
        //doj: this.getDateFromText(organisation.doj),
        organizationName: organisation.name,
        designation: organisation.designation,
        //location: organisation.location,
      })
    }
  }

  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            console.log(data.profileDetails.profileReq)
            this.userProfileData = data.profileDetails.profileReq
            this.userlang = data
            if (this.workLog === 'true' || this.workLog.edit === true) {
              console.log('true')
              this.updateForm()
            } else {
              this.workInfoForm.reset()
            }
            this.route.queryParams.subscribe(isEdit => {
              if (isEdit.isEdit) {
                this.updateForm()
              }
            })
          }
        })
    }
  }

  onSubmit(form: any) {
    console.log(form, form.value)
    if (form.doj) {
      form.doj = changeformat(new Date(`${form.doj}`))
    }
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    let userAgent = this.UserAgentResolverService.getUserAgent()
    let userCookie = this.UserAgentResolverService.generateCookie()
    let profileRequest = constructReq(form, this.userProfileData, userAgent, userCookie)
    const obj = {
      preferences: {
        language: local === 'en' ? 'en' : 'hi',
      },
      personalDetails: profileRequest.profileReq.personalDetails
    }
    profileRequest = Object.assign(profileRequest, obj)

    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: profileRequest,
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          this.workInfoForm.reset()
          console.log(locale)
          if (local === 'en') {
            this.openSnackbar(this.toastSuccess.nativeElement.value)
          } else {
            this.openSnackbar('उपयोगकर्ता प्रोफ़ाइल विवरण सफलतापूर्वक अपडेट किया गया!')
          }
          //this.openSnackbar(this.toastSuccess.nativeElement.value)
          this.router.navigate(['/app/workinfo-list'])
        }
      })
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
  ngOnDestroy() {
    if (this.change) {
      this.change.unsubscribe()
    }
  }

  // private getDateFromText(dateString: string): any {
  //   if (dateString) {
  //     const splitValues: string[] = dateString.split('-')
  //     const [dd, mm, yyyy] = splitValues
  //     const dateToBeConverted = `${yyyy}-${mm}-${dd}`
  //     return new Date(dateToBeConverted)
  //   }
  //   return ''
  // }
}

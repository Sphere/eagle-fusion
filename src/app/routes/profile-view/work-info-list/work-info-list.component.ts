import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
// import { Router } from '@angular/router'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '@ws-widget/collection'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { constructReq } from '../request-util'
import { MatSnackBar } from '@angular/material'
@Component({
  selector: 'ws-work-info-list',
  templateUrl: './work-info-list.component.html',
  styleUrls: ['./work-info-list.component.scss'],
})

export class WorkInfoListComponent implements OnInit {
  professions = ['Healthcare Worker', 'Healthcare Volunteer', 'ASHA', 'Student', 'Faculty', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  userProfileData!: IUserProfileDetailsFromRegistry
  showbackButton = false
  showLogOutIcon = false
  trigerrNavigation = true
  personalDetailForm: FormGroup
  orgTypeField = false
  orgOthersField = false
  rnShow = false
  professionOtherField = false
  showDesignation = false
  showAshaField = false
  userID = ''
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    // private router: Router,
    private valueSvc: ValueService,
    private contentSvc: WidgetContentService,
    private UserAgentResolverService: UserAgentResolverService,
    private snackBar: MatSnackBar,
  ) {
    this.personalDetailForm = new FormGroup({
      profession: new FormControl(),
      designation: new FormControl(),
      professionOtherSpecify: new FormControl(),
      regNurseRegMidwifeNumber: new FormControl(),
      orgType: new FormControl(),
      orgOtherSpecify: new FormControl(),
      organizationName: new FormControl(),
      block: new FormControl(),
      subcentre: new FormControl(),
    })
  }

  ngOnInit() {
    this.getUserDetails()
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall) {
        this.showbackButton = true
        this.showLogOutIcon = false

      } else {
        this.showbackButton = false
        this.showLogOutIcon = false
      }
    })
  }
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {

            const newData = data.profileDetails.profileReq
            this.userProfileData = data.profileDetails.profileReq
            if (newData && newData.professionalDetails) {
              (newData.professionalDetails[0].orgType === 'Others' && newData.professionalDetails[0].orgOtherSpecify) ? this.orgOthersField = true : this.orgOthersField = false;
              (newData.professionalDetails[0].profession === 'Others' && newData.professionalDetails[0].professionOtherSpecify) ? this.professionOtherField = true : this.professionOtherField = false;
              (newData.professionalDetails[0].designation) ? this.showDesignation = true : this.showDesignation = false
              newData.professionalDetails[0].profession === 'Healthcare Worker' ? this.rnShow = true : this.rnShow = false
              newData.professionalDetails[0].profession === 'ASHA' ? this.showAshaField = true : this.showAshaField = false

              this.personalDetailForm.patchValue({
                profession: newData.professionalDetails[0].profession,
                professionOtherSpecify: newData.professionalDetails[0].professionOtherSpecify,
                orgType: newData.professionalDetails[0].orgType,
                orgOtherSpecify: newData.professionalDetails[0].orgOtherSpecify,
                organizationName: newData.professionalDetails[0].name,
                block: newData.professionalDetails[0].block,
                subcentre: newData.professionalDetails[0].subcentre,
                designation: newData.professionalDetails[0].designation,
              })
              if (newData.professionalDetails[0].profession === 'Healthcare Worker') {
                this.personalDetailForm.patchValue({
                  regNurseRegMidwifeNumber: newData.personalDetails.regNurseRegMidwifeNumber,
                })
              }
            }
          }
        })
    }
  }
  professionalChange(value: any) {
    console.log(value)
    // this.savebtnDisable = false
    if (value === 'Healthcare Worker') {
      this.rnShow = true
      this.showDesignation = true
      this.orgTypeField = false
      this.professionOtherField = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
    } else if (value === 'Healthcare Volunteer') {
      this.orgTypeField = false
      this.professionOtherField = false
      this.showAshaField = false
      this.rnShow = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
    } else if (value === 'ASHA') {
      this.showAshaField = true
    } else if (value === 'Faculty') {
      this.orgOthersField = false
      this.orgTypeField = false
      this.rnShow = false
    } else if (value === 'Others') {
      this.rnShow = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.professionOtherField = true
      this.orgTypeField = false
    } else if (value === 'Student') {
      this.orgOthersField = false
      this.orgTypeField = false
      this.rnShow = false
    } else {
      this.orgTypeField = true
      this.rnShow = false
      this.professionOtherField = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.personalDetailForm.controls.orgType.setValue(null)
    }
  }

  orgTypeSelect(option: any) {
    // this.savebtnDisable = false
    if (option !== 'null') {
      this.personalDetailForm.controls.orgType.setValue(option)
    } else {
      this.personalDetailForm.controls.orgType.setValue(null)
    }

    if (option === 'Others') {
      this.orgOthersField = true
      this.personalDetailForm.controls.orgOtherSpecify.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)])
    } else {
      this.orgOthersField = false
      this.personalDetailForm.controls.orgOtherSpecify.clearValidators()
      this.personalDetailForm.controls.orgOtherSpecify.setValue('')
    }
  }

  onSubmit(form: any) {
    console.log('form submission', form)
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const userAgent = this.UserAgentResolverService.getUserAgent()
    const userCookie = this.UserAgentResolverService.generateCookie()
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'

    let profileRequest = constructReq(form.value, this.userProfileData, userAgent, userCookie)
    const obj = {
      personalDetails: profileRequest.profileReq.personalDetails,
    }
    profileRequest = Object.assign(profileRequest, obj)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: profileRequest,
      },
    }
    console.log('request update', reqUpdate)
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          // form.reset()
          console.log(res, 'res')
          if (local === 'en') {
            this.openSnackbar(this.toastSuccess.nativeElement.value)
          } else {
            this.openSnackbar('उपयोगकर्ता प्रोफ़ाइल विवरण सफलतापूर्वक अपडेट किया गया!')
          }

          // this.userProfileSvc._updateuser.next('true')
          const ob = {
            type: 'work',
            edit: 'save',

          }
          this.contentSvc.changeWork(ob)
          // this.router.navigate(['/app/education-list'])
        }
      })
  }
  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
  redirectToWorkInfo(isEdit: any) {

    const ob = {
      type: 'work',
      edit: isEdit,
    }
    console.log(ob)
    if (sessionStorage.getItem('work')) {
      sessionStorage.removeItem('work')
    }
    sessionStorage.setItem('work', isEdit)
    this.contentSvc.changeWork(ob)
    // this.contentSvc.changeBack('/app/workinfo-list')
    // if (isEdit) {
    //   this.router.navigate([`app/workinfo-edit`], {
    //     queryParams: { isEdit },
    //   })
    // } else {
    //   this.router.navigate([`app/workinfo-edit`])
    // }

  }
}

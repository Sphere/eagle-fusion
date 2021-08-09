import { Injectable } from '@angular/core'
import analytics from '@aws-amplify/analytics'
import auth from '@aws-amplify/auth'
import { ConfigurationsService } from '../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { IUserProfileDetailsFromRegistry } from '../../../../app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../app/src/lib/routes/user-profile/services/user-profile.service'

@Injectable({
  providedIn: 'root',
})
export class AwsAnalyticsService {

  amplifyConfig = {
    Auth: {
      identityPoolId: 'ap-south-1:0800b383-9ce1-4eb0-81ca-2ac44373f2b9',
      region: 'ap-south-1',
    },
  }

  analyticsConfig = {
    AWSPinpoint: {
      // Amazon Pinpoint App Client ID
      appId: 'f6f5641819624ad7b0d39c1af4596240',
      // Amazon service region
      region: 'ap-south-1',
      mandatorySignIn: false,
    },
  }

  constructor(
    private userProfileSvc: UserProfileService,
    private configSvc: ConfigurationsService
  ) { }

  userProfileData!: IUserProfileDetailsFromRegistry
  addressArray: any
  userDetails = {
    name: '',
    email: '',
    gender: '',
    wid: '',
    age: 0,
    profession: '',
    country: '',
    state: '',
    city: '',
  }

  awsAnlyticsService(eventName: any, userid: any) {
    auth.configure(this.amplifyConfig)
    analytics.configure(this.analyticsConfig)

    // console.log('start')
    this.getUserDetails()
    // Analytics.record({ name: '' })
    analytics.record({
      name: eventName,
      attributes: { userid },
    })

    // console.log('end')
  }

  getUserDetails() {
    this.userProfileSvc.getUserdetailsFromRegistry().subscribe(
      data => {
        if (data && data.length) {
          this.userProfileData = data[0]
          // this.userDetails.name = this.userProfileData.personalDetails.firstname + ' ' +
          //   this.userProfileData.personalDetails.middlename ? this.userProfileData.personalDetails.middlename + ' ' : ''
          // + this.userProfileData.personalDetails.surname
          this.userDetails.name = this.userProfileData.personalDetails.firstname + ' ' + this.userProfileData.personalDetails.surname
          this.userDetails.email = this.userProfileData.personalDetails.primaryEmail
          this.userDetails.wid = this.configSvc.userRegistryData.value.userId
          this.userDetails.gender = this.userProfileData.personalDetails.gender
          this.userDetails.profession = this.userProfileData.professionalDetails[0].designation
          this.userDetails.age = new Date().getFullYear() - parseInt(this.userProfileData.personalDetails.dob.slice(6))

          const address = this.userProfileData.personalDetails.postalAddress
          this.addressArray = address.split(',')
          if (this.addressArray.length > 1) {
            this.userDetails.state = this.addressArray[1]
            this.userDetails.city = this.addressArray[2]
          }
          this.userDetails.country = this.addressArray[0]
          // console.log('test', this.userDetails)
        }
      })
  }
}

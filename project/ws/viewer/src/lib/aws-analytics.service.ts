import { Injectable } from '@angular/core'
import analytics from '@aws-amplify/analytics'
import auth from '@aws-amplify/auth'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { IUserProfileDetailsFromRegistry } from '../../../app/src/lib/routes/user-profile/models/user-profile.model'

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
    private configSvc: ConfigurationsService
  ) { }

  userProfileData!: IUserProfileDetailsFromRegistry
  addressArray: any
  registerUser: any
  userDetails = {
    name: '',
    email: '',
    gender: '',
    wid: '',
    age: 0,
    profession: '',
    country: '',
    state: '',
    distict: '',
  }

  awsAnlyticsService(eventName: any) {
    auth.configure(this.amplifyConfig)
    analytics.configure(this.analyticsConfig)

    this.getUserDetails()
    analytics.record({
      name: eventName,
      attributes: { userId: this.userDetails.email },
    })
  }

  getUserDetails() {
    this.registerUser = this.configSvc.userRegistryData.value
    if (this.registerUser) {
      const middlename = this.registerUser.personalDetails.middlename ? ` ${this.registerUser.personalDetails.middlename} ` : ' '

      this.userDetails.name = this.registerUser.personalDetails.firstname + middlename + this.registerUser.personalDetails.surname
      this.userDetails.email = this.registerUser.personalDetails.primaryEmail
      this.userDetails.wid = this.registerUser.userId
      this.userDetails.gender = this.registerUser.personalDetails.gender ? this.registerUser.personalDetails.gender : ''
      this.userDetails.profession = this.registerUser.professionalDetails[0].designation
      // tslint:disable
      this.userDetails.age = new Date().getFullYear() - parseInt(this.registerUser.personalDetails.dob.slice(6))

      const address = this.registerUser.personalDetails.postalAddress
      this.addressArray = address.split(',')
      if (this.addressArray.length > 1) {
        this.userDetails.state = this.addressArray[1]
        this.userDetails.distict = this.addressArray[2]
      }
      this.userDetails.country = this.addressArray[0]
    }
  }

  callAnalyticsEndpointServiceWithoutAttribute(attribute: any) {
    this.getUserDetails()

    const endPointAttr = {
      wid: [this.userDetails.wid],
      username: [this.userDetails.name],
      age: [this.userDetails.age],
      gender: [this.userDetails.gender],
      profession: [this.userDetails.profession],
    }

    const userAttr = {
      wid: this.userDetails.wid,
      username: this.userDetails.name,
      age: this.userDetails.age,
      gender: this.userDetails.gender,
      profession: this.userDetails.profession,
    }

    attribute.attributes = { ...userAttr }

    if (this.userDetails.email) {
      // Initialize Amplify
      auth.configure(this.amplifyConfig)
      analytics.configure(this.analyticsConfig)
      try {

        analytics.updateEndpoint({
          address: this.userDetails.email,
          attributes: endPointAttr,
          channelType: 'EMAIL',
          location: {
            city: this.userDetails.distict,
            country: 'IN',
            region: this.userDetails.state,
          },
          optOut: 'NONE',
          userId: this.userDetails.email,
          userAttributes: {
            wid: [this.userDetails.wid],
            username: [this.userDetails.name],
            age: [this.userDetails.age],
            gender: [this.userDetails.gender],
            profession: [this.userDetails.profession],
          },
        }).then(() => {
          analytics.record(attribute)
        })
      } catch (e) {
        // tslint:disable-next-line: no-console
        console.log(e)
      }

    } else {
      auth.configure(this.amplifyConfig)
      analytics.configure(this.analyticsConfig)
      analytics.record(attribute)
    }
  }

  callAnalyticsEndpointService(attribute: any, endPointAttribute: any) {
    this.getUserDetails()

    const userEndpointAttr = {
      wid: [this.userDetails.wid],
      username: [this.userDetails.name],
      age: [this.userDetails.age],
      gender: [this.userDetails.gender],
      profession: [this.userDetails.profession],
    }

    const userAttr = {
      wid: this.userDetails.wid,
      username: this.userDetails.name,
      age: this.userDetails.age,
      gender: this.userDetails.gender,
      profession: this.userDetails.profession,
    }

    const endPointAttr = {
      ...userEndpointAttr, ...endPointAttribute,
    }
    attribute.attributes = { ...attribute.attributes, ...userAttr }

    // Initialize Amplify
    auth.configure(this.amplifyConfig)
    analytics.configure(this.analyticsConfig)
    try {
      analytics.updateEndpoint({
        address: this.userDetails.email,
        attributes: endPointAttr,
        channelType: 'EMAIL',
        location: {
          city: this.userDetails.distict,
          country: 'IN',
          region: this.userDetails.state,
        },
        optOut: 'NONE',
        userId: this.userDetails.email,
        userAttributes: {
          wid: [this.userDetails.wid],
          username: [this.userDetails.name],
          age: [this.userDetails.age],
          gender: [this.userDetails.gender],
          profession: [this.userDetails.profession],
        },
      }).then(() => {
        analytics.record(attribute)
      })
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log(e)
    }


  }


}

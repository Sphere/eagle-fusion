export interface IScheduleObj {
  startDate: string
  endDate: string
  location: string
  search: string
}

export interface IRegisterObj {
  courseId: number
}

export interface IDateObj {
  startDate: string
  endDate: string

}

export interface IOfferingData {
  key: string
  value: number
}

export interface IScheduleData {
  courseCode: string
  courseDescription: string
  dtEndDate: string
  dtInsertedES: string
  dtStartDate: string
  intCourseOfferingId: string
  location: string
  offeringMode: string
  offeringOrder: number
  registrationCount: number
  title: string,
  isRegister?: any
}

export interface IScheduleDataResponse {
  hits: IScheduleData[]
  indexedOn: string
  offeringsCount: number
  refiners: [{
    offeringMode: IOfferingData[]
  }]
  total: number
}

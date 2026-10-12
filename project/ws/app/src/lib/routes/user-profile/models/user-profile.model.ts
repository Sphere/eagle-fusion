export interface IUserProfileDetails {
  first_name: string
  last_name: string
  email: string
  wid: string
}

export interface IUserProfileDetailsFromRegistry {
  'firstname': string,
  'motherTongue': string,
  'secondaryEmail': string,
  'gender': string,
  '@type': string,
  'mobile': number,
  'middlename': string,
  'telephone': number,
  'osid': string,
  'primaryEmailType': string,
  'knownLanguages': ILanguages[],
  'wid': string,
  'nationality': string,
  'surname': string,
  'dob': string,
  'category': string,
  'primaryEmail': string,
  'maritalStatus': string,
  'residenceAddress': string,
  'academics': any,
  'photo': string,
  'personalDetails': any,
  'professionalDetails': any,
  'skills': any,
  'interests': any,
  'userId': any,
  'id': any
}

export interface IUserProfileFields2 {
  'firstname'?: string,
  'middlename'?: string,
  'surname'?: string,
  'dob'?: string,
  'nationality'?: string,
  'domicileMedium'?: string,
  'gender'?: string,
  'maritalStatus'?: string,
  'category'?: string,
  'knownLanguages'?: [string],
  'countryCode'?: string,
  'mobile'?: string,
  'telephone'?: string,
  'primaryEmail': string,
  'officialEmail': string,
  'personalEmail'?: string,
  'postalAddress'?: string,
  'pincode'?: string,
}
export interface ILanguages {
  name: string
}

export interface IChipItems {
  name: string
}

export interface ILanguagesApiData {
  languages: ILanguages[]
}

export interface INation {
  name: string
}
export interface INationality {
  name: string
  countryCode: string
}
export interface INationalityApiData {
  nationalities: INationality[]
}

export interface INameField {
  name: string
}

export interface IGovtOrgMeta {
  ministries: INameField[]
  service: INameField[]
  cadre: INameField[]
}
export interface IIndustriesMeta {
  industries: INameField[]
}

export interface IStatesMeta {
  states: INameField[]
}

// tslint:disable-next-line: interface-name
export interface IdegreesMeta {
  graduations: INameField[]
  postGraduations: INameField[]
}
// tslint:disable-next-line: interface-name
export interface IdesignationsMeta {
  designations: INameField[]
  gradePay: INameField[]
}

export interface IProfileMetaApiData {
  govtOrg: IGovtOrgMeta
  industries: IIndustriesMeta
  degrees: IdegreesMeta
  designations: IdesignationsMeta
  states: IStatesMeta
}

export interface IProfileAcademics {
  nameOfQualification: string,
  type: string,
  nameOfInstitute: string,
  yearOfPassing: string,
}

export interface IDegreeData {
  degree: string
  instituteName: string
  yop: string
}

export interface IAcademicsData {
  X_STANDARD: {
    schoolName10: string
    yop10: string
  }
  XII_STANDARD: {
    schoolName12: string
    yop12: string
  }
  degree: IDegreeData[]
  postDegree: IDegreeData[]
}

export interface IOrganisationDetails {
  orgName: string
  industry: string
  designation: string
  location: string
  responsibilities: string
  doj: string | Date | null
  orgDesc: string
  completePostalAddress: string
  orgNameOther: string
  industryOther: string
  profession: string
  orgType: string
  orgOtherSpecify: string
  professionOtherSpecify: string
}

export interface ISelectOptionValue<T> {
  option: {
    value: T
  }
}

export interface IUserContextData {
  lang?: string
  id?: string
}

import { ILanguages } from './user-profile.model'
export namespace NsUserProfileDetails {
  export interface IUserProfileFields {
    'firstname': string
    'motherTongue': string
    'secondaryEmail': string
    'gender': string
    'mobile': number
    'middlename': string
    'telephone': number
    'primaryEmailType': string
    'knownLanguages': ILanguages[]
    'nationality': string
    'surname': string
    'dob': string
    'category': string
    'primaryEmail': string
    'maritalStatus': string
    'residenceAddress': string
  }

  export interface IAcademics {
    X_STANDARD: any,
    XII_STANDARD: any,
    degree: any,
    postDegree: any,
  }

  export interface IGraduation {
    degree: any
    instituteName: any
    yop: any
  }

  export enum EPrimaryEmailType {
    PERSONAL = 'personal',
    OFFICIAL = 'official',
  }
  export enum EUserGender {
    MALE = 'Male',
    FEMALE = 'Female',
    OTHER = 'Others',
  }
  export enum EMaritalStatus {
    SINGLE = 'Single',
    MARRIED = 'Married',
  }
  export enum ECategory {
    GENERAL = 'General',
    OBC = 'OBC',
    SC = 'SC',
    ST = 'ST',
  }
  export interface IFieldApproval {
    approvalRequired: boolean
    approvalFiels: string[]
  }
  export interface IApprovals {
    academics: IFieldApproval
    competencies: IFieldApproval
    employmentDetails: IFieldApproval
    personalDetails: IFieldApproval
    professionalDetails: IFieldApproval
  }
}

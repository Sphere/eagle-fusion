export namespace NsTnc {
  export interface ITnc {
    isAccepted: boolean
    isNewUser?: boolean
    termsAndConditions: ITncUnit[]
  }
  export interface ITncUnit {
    acceptedDate: Date
    acceptedLanguage: string
    acceptedVersion: string
    availableLanguages: string[]
    content: string
    isAccepted: boolean
    language: string
    name: 'Generic T&C' | 'Data Privacy'
    version: string
  }
  export interface ITncAcceptRequest {
    termsAccepted: ITermAccepted[]
  }
  export interface ITermAccepted {
    acceptedLanguage: string
    docName: string
    version: string
  }
}

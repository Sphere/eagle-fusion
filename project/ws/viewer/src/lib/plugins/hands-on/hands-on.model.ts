import { SafeHtml } from '@angular/platform-browser'

export namespace NSHandsOnModels {

  export interface IProgLanguage {
    id: number
    language: string
    mode: string
  }

  export interface IHandsOnJson {
    title: string
    supportedLanguages: IProgLanguage[]
    problemStatement: string
    starterCodes: string[]
    timeLimit: number
    safeProblemStatement?: SafeHtml
    fpTestCase?: any
    testcases?: any
    forFPCourse?: boolean
  }

}

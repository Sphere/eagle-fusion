export interface IHtmlPicker {
  question: string
  htmlPresent: boolean
  cssPresent: boolean
  javascriptPresent: boolean
  html: string
  css: string
  javascript: string
  cdnLinks?: any[]
}

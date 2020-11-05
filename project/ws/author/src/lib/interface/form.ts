import { NSContent } from './content'

export type IValueType = 'boolean' | 'array' | 'string' | 'number' | 'object'
export type ICondition = {
  [key in keyof NSContent.IContentMeta]: any[]
}

export type IFormMeta = {
  [key in keyof NSContent.IContentMeta]: {
    showFor: {
      [value in NSContent.IContentType]: ICondition[]
    },
    notShowFor: {
      [value in NSContent.IContentType]: ICondition[]
    },
    notMandatoryFor: {
      [value in NSContent.IContentType]: ICondition[]
    },
    mandatoryFor: {
      [value in NSContent.IContentType]: ICondition[]
    },
    disabledFor: {
      [value in NSContent.IContentType]: ICondition[]
    },
    notDisabledFor: {
      [value in NSContent.IContentType]: ICondition[]
    },
    defaultValue: {
      [value in NSContent.IContentType]: {
        condition: ICondition,
        value: any
      }[]
    },
    type: IValueType
  }
}

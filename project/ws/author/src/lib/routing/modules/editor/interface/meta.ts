import { IConditionsV2 } from './../../../../interface/conditions-v2'

export interface IMetaUnit<T> {
  // Meta name
  name: string
  // Tenant specific display name
  displayName: IConditionValue<string>[]
  info: IConditionValue<string>[]
  defaultValue: IConditionValue<any>[]
  isMandatory: IConditionsV2[]
  canShow: IConditionsV2[]
  isDisabled: IConditionsV2[]
  meta: T
  // inputType:
  //   | 'text'
  //   | 'textArea'
  //   | 'dropDown'
  //   | 'richText'
  //   | 'employeeSearch'
  //   | 'matChips'
  //   | 'contentSearch'
  canCascade: boolean
  format: 'string' | 'boolean' | 'array' | 'object'
}

export interface IMetaTextUnit {
  inputType: 'text'
  validations: {
    minLength: IConditionValue<number>
    maxLength: IConditionValue<number>
    noOfWords: IConditionValue<number>
  }
}

export interface IMetaTextAreaUnit {
  inputType: 'textArea'
  validations: {
    minLength: IConditionValue<number>
    maxLength: IConditionValue<number>
    noOfWords: IConditionValue<number>
  }
  minRows: IConditionValue<number>
  maxRows: IConditionValue<number>
  autoExtend: IConditionValue<boolean>
}

export interface IMetaDropDownUnit {
  inputType: 'dropDown'
  validations: {
    minLength: IConditionValue<number>
    maxLength: IConditionValue<number>
  }
  isMultiple: IConditionValue<boolean>
  displayValue?: string
}

export interface IConditionValue<T> {
  conditions: IConditionsV2
  value: T
}

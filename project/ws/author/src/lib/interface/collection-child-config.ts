import { IConditionsV2 } from './conditions-v2'

export interface IAllowedType {
  conditions: IConditionsV2
  position: '*' | 'n' | 'n-1'
  minimum: number
  maximum: number
}

export interface ICollectionChildConfig {
  [key: string]: {
    minChildren: number
    allowCreation: boolean
    maxChildren: number
    childTypes: IAllowedType[]
    allowedCreationType?: string[]
    searchFilter: {
      contentType: string[]
      status: string[]
    }
  }
}

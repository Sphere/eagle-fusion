import { IActionButtonConfig } from './action-button'
import { IAuthSteps } from './auth-stepper'
import { ICollectionChildConfig } from './collection-child-config'

export interface ICollectionEditorConfig {
  maxDepth: number
  actionButtons: IActionButtonConfig
  stepper: IAuthSteps[]
  languageBar: boolean
  childrenConfig: ICollectionChildConfig
  enabledRole: string[]
}

import { IConditionsV2 } from './conditions-v2'
/**
 * @description Interface for the Authoring tool Action Button Input Configuration
 *
 * @export
 * @interface IButtonConfig
 *
 */
export interface IActionButtonConfig {
  /**
   * @description Whether the button is expanded by default or not
   *
   * @type {boolean}
   * @memberof IActionButtonConfig
   */
  enabled: boolean
  /**
   * @description Array of action buttons which needs to be displayed
   *
   * @type {IActionButton[]}
   * @memberof IActionButtonConfig
   */
  buttons: IActionButton[]
}

/**
 * @description Configuration for individual action button
 *
 * @export
 * @interface IActionButton
 */
export interface IActionButton {
  /**
   * Name of the button
   *
   * @type {string}
   * @memberof IActionButton
   */
  title: string
  /**
   * Event name to be triggered on clicking the button
   *
   * @type {string}
   * @memberof IActionButton
   */
  event: string
  /**
   * Mat icon to used for this button
   *
   * @type {string}
   * @memberof IActionButton
   */
  icon: string

  conditions: IConditionsV2
}

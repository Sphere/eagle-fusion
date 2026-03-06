/**
 * Downtime Configuration Models
 * Defines the structure for maintenance/downtime configuration
 */

export type DowntimeType = 'full' | 'partial'

/**
 * CSS configuration for styling the downtime UI
 */
export interface DowntimeCssConfig {
  theme?: 'light' | 'dark'
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  bannerColor?: string
  borderColor?: string
  position?: 'top' | 'bottom'
  borderPosition?: 'left' | 'right' | 'top' | 'bottom' | 'none'
}

/**
 * Multilingual content for downtime UI
 */
export interface MultilingualContent {
  en: string
  hi: string
  [key: string]: string
}

/**
 * App link configuration for downtime UI
 */
export interface AppLink {
  isEnabled: boolean
  url: string
  label: string
  hint?: string
}

/**
 * Content configuration for downtime UI
 */
export interface DowntimeContent {
  icon: string
  title: MultilingualContent
  message: MultilingualContent
  css?: DowntimeCssConfig
  appLink?: AppLink
}

/**
 * Application-specific downtime configuration
 */
export interface AppDowntimeConfig {
  isEnabled: boolean
  type: DowntimeType
  refreshInterval: number // seconds
  content: DowntimeContent
}

/**
 * Complete downtime configuration from backend
 * Maps application names to their downtime configs
 */
export interface DowntimeConfigResponse {
  WEB: {
    [appName: string]: AppDowntimeConfig
  }
}

/**
 * Internal state for tracking downtime status
 */
export interface DowntimeState {
  isDowntime: boolean
  type: DowntimeType
  content: DowntimeContent
  refreshTimer?: any
}

/**
 * Default values for various configuration fields
 */
export const DOWNTIME_DEFAULTS = {
  REFRESH_INTERVAL: 3600, // 1 hour
  DEFAULT_ICON: 'wrench',
  DEFAULT_THEME: 'light',
  PRIMARY_COLOR: '#1F4E79',
  BACKGROUND_COLOR: '#F5F5F5',
  TEXT_COLOR: '#222222',
  BANNER_COLOR: '#FFF3CD',
  BORDER_COLOR: '#CE9A39',
  FALLBACK_MESSAGE: {
    title: {
      en: 'System under maintenance',
      hi: 'सिस्टम मेंटेनेंस के तहत है',
    },
    message: {
      en: 'We\'re making improvements. Please check back soon.',
      hi: 'हम सुधार कर रहे हैं। कृपया बाद में पुनः प्रयास करें।',
    },
  },
}

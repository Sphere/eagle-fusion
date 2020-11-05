export interface IWSPublicLoginConfig {
  bodyBackgroundImageUrl: string
  footer: ILoginFooterConfig
  topbar: ILoginTopbarConfig
  isClient: boolean
  loginButtons?: { [key: string]: string }
}

export interface ILoginFooterConfig {
  contactUs: boolean
  copyright: boolean
  faq: boolean
  aboutUs: boolean
  hasLogo?: boolean
  mobileApps?: boolean
  isVisible?: boolean
  logoUrl?: string
  tnc: boolean
  descriptiveInfo?: { [key: string]: string }
  descriptiveFooter?: ILoginDescriptiveFooterConfig
  android?: string
  ios?: string
}

export interface ILoginDescriptiveFooterConfig {
  available: boolean
  welcomeMessage: string
  welcomeTagline: string
}

export interface ILoginTopbarConfig {
  about: boolean
  apps: boolean
  hasLogo: boolean
  isVisible: boolean
  logoUrl: string
}

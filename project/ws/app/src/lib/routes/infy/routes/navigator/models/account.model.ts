export interface IIndustries {
  [industry: string]: {
    [account: string]: IAccount;
  }
}

export interface IAccount {
  [subAccounts: string]: ISubAccount
}

export interface ISubAccount {
  [pillar: string]: IPillar
}

export interface IPillar {
  [subPillar: string]: ISubPillar
}
export interface ISubPillar {
  themeName: string
  overview: IPillarSection[]
  gtm: IPillarSection[]
  tech: IPillarSection[]
}
export interface IPillarSection {
  identifier: string
  lpId: string
  title: string
  description: string
  thumbnail: string
  url: string
}

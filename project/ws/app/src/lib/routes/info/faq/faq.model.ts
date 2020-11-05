export interface IContent {
  heading: string
  value: string
}

export interface IFAQ {
  groupName: string
  groupShortName: string
  groupKey?: string
  contents: IContent[]
}

export interface IActivityCard {
  id: string
  title: string
  description: string
  icon?: string
  status?: string
  isNew: boolean
  clickUrl: string
  tag: string,
  hasRole: string[]
}
export interface IActivity {
  activities: IActivityCard[]
}
export interface IChallenges {
  tag: string
  activities: IActivityCard[]
}

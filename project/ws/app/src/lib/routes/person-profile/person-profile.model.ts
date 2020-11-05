export interface IFollowerId {
  identifier: string,
  name: string
}
export interface IFollowers {
  count: number,
  data: IFollowerId[],
  pageState?: string
}
export interface IFollowDetails {
  email: string,
  first_name?: string,
  last_name?: string,
  residence_city?: string,
  residence_country?: string,
  unit_name?: string,
  wid?: string,
  source_profile_picture?: string

}

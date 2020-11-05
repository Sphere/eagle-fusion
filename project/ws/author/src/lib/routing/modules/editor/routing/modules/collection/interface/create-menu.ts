export interface ICustomCreateEntity {
  id: string
  name: string
  icon: string
  children: ICustomCreateEntity[]
}

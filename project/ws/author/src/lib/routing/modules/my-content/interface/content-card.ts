import { ISearchContent } from '@ws/author/src/lib/interface/search'

export interface IAction {
  action: string
  content: ISearchContent
}

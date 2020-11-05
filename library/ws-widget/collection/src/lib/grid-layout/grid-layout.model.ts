import { NsWidgetResolver } from '@ws-widget/resolver'
type tDimensions = 'small' | 'medium' | 'large' | 'xLarge'
type tSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export const responsiveSuffix: Record<tDimensions, string> = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
  xLarge: 'xl',
}

export const sizeSuffix: Record<tSize, string> = {
  1: 'w-1/12',
  2: 'w-2/12',
  3: 'w-3/12',
  4: 'w-4/12',
  5: 'w-5/12',
  6: 'w-6/12',
  7: 'w-7/12',
  8: 'w-8/12',
  9: 'w-9/12',
  10: 'w-10/12',
  11: 'w-11/12',
  12: 'w-full',
}

export interface IGridLayoutDataMain {
  gutter?: number
  widgets: IGridLayoutData[][]
  fromBasicEditor: boolean
}

export interface IGridLayoutData {
  dimensions: Record<tDimensions, tSize>
  widget: NsWidgetResolver.IRenderConfigWithAnyData
  styles?: { [k: string]: string }
  className: string
}
export interface IGridLayoutProcessedData {
  className: string
  styles?: { [k: string]: string }
  widget: NsWidgetResolver.IRenderConfigWithAnyData
}

export interface IWidgetImageMap {
  imageHeight: number
  imageWidth: number
  imageSrc: string
  mapName: string
  map: IWidgetMapMeta[]
  externalData?: string
  containerStyle?: { [key: string]: string }
  containerClass?: string
}

export interface IWidgetMapMeta {
  coords: number[]
  alt: string
  title: string
  link: string
  target?: string
}

export interface IWidgetMapCoords {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface IWidgetScale {
  height: number
  width: number
}

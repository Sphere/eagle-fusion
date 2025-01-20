import videojs from 'video.js'

declare module 'video.js' {
  export interface VideoJsPlayer {
    markers?: (options: {
      markerStyle: { [key: string]: string }
      markers: Array<{ time: number; text: string }>
    }) => void
  }
}

declare global {
  // tslint:disable-next-line: interface-name
  interface Document {
    mozCancelFullScreen?: () => void
    webkitExitFullscreen?: () => void
    msExitFullscreen?: () => void

    fullscreenElement: null | HTMLElement
    webkitFullscreenElement: null | HTMLElement
    mozFullScreenElement: null | HTMLElement
    msFullscreenElement: null | HTMLElement
  }
  // tslint:disable-next-line: interface-name
  export interface HTMLElement {
    mozRequestFullScreen?: () => void
    webkitRequestFullscreen?: () => void
    msRequestFullscreen?: () => void
  }
}

export function getFullScreenElement() {
  return (
    document.fullscreenElement /* Standard syntax */ ||
    document.webkitFullscreenElement /* Chrome, Safari and Opera syntax */ ||
    document.mozFullScreenElement /* Firefox syntax */ ||
    document.msFullscreenElement /* IE/Edge syntax */
  )
}

export function requestFullScreen(elem: HTMLElement) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen()
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen()
  }
}

export function requestExitFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.mozCancelFullScreen) {
    /* Firefox */
    document.mozCancelFullScreen()
  } else if (document.webkitExitFullscreen) {
    /* Chrome, Safari and Opera */
    document.webkitExitFullscreen()
  } else if (document.msExitFullscreen) {
    /* IE/Edge */
    document.msExitFullscreen()
  }
}

export function hasFullScreenSupport(elem: HTMLElement) {
  return (
    Boolean(elem.requestFullscreen) ||
    Boolean(elem.mozRequestFullScreen) ||
    Boolean(elem.webkitRequestFullscreen) ||
    Boolean(elem.msRequestFullscreen)
  )
}

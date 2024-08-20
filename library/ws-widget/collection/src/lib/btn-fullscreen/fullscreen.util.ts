declare global {
  interface Document {
    mozCancelFullScreen?: () => void
    webkitExitFullscreen?: () => void
    msExitFullscreen?: () => void

    fullscreenElement: null | HTMLElement
    webkitFullscreenElement: null | HTMLElement
    mozFullScreenElement: null | HTMLElement
    msFullscreenElement: null | HTMLElement
  }

  interface HTMLElement {
    mozRequestFullScreen?: () => void
    webkitRequestFullscreen?: () => void
    msRequestFullscreen?: () => void
  }
}

export function getFullScreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  )
}

export function requestFullScreen(elem: HTMLElement) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen()
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen()
  }
}

export function requestExitFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.msExitFullscreen) {
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

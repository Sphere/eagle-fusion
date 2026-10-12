import {
  getFullScreenElement,
  hasFullScreenSupport,
  requestExitFullScreen,
  requestFullScreen,
} from './fullscreen.util'

describe('fullscreen.util', () => {
  const docKeys = [
    'fullscreenElement',
    'webkitFullscreenElement',
    'mozFullScreenElement',
    'msFullscreenElement',
    'exitFullscreen',
    'mozCancelFullScreen',
    'webkitExitFullscreen',
    'msExitFullscreen',
  ]

  const setDoc = (props: Record<string, any>) => {
    docKeys.forEach(k => {
      Object.defineProperty(document, k, { value: undefined, configurable: true, writable: true })
    })
    Object.entries(props).forEach(([k, v]) => {
      Object.defineProperty(document, k, { value: v, configurable: true, writable: true })
    })
  }

  afterEach(() => {
    setDoc({})
    jest.clearAllMocks()
  })

  describe('getFullScreenElement', () => {
    it('should return null when nothing is fullscreen', () => {
      setDoc({})
      expect(getFullScreenElement()).toBeNull()
    })

    it('should prefer the standard fullscreenElement', () => {
      const el = document.createElement('div')
      setDoc({ fullscreenElement: el, webkitFullscreenElement: document.createElement('p') })
      expect(getFullScreenElement()).toBe(el)
    })

    it('should fall back to the webkit element', () => {
      const el = document.createElement('div')
      setDoc({ webkitFullscreenElement: el })
      expect(getFullScreenElement()).toBe(el)
    })

    it('should fall back to the moz element', () => {
      const el = document.createElement('div')
      setDoc({ mozFullScreenElement: el })
      expect(getFullScreenElement()).toBe(el)
    })

    it('should fall back to the ms element', () => {
      const el = document.createElement('div')
      setDoc({ msFullscreenElement: el })
      expect(getFullScreenElement()).toBe(el)
    })
  })

  describe('requestFullScreen', () => {
    const buildElem = (props: Record<string, any>) => props as any as HTMLElement

    it('should prefer the standard requestFullscreen', () => {
      const standard = jest.fn()
      const moz = jest.fn()
      requestFullScreen(buildElem({ requestFullscreen: standard, mozRequestFullScreen: moz }))
      expect(standard).toHaveBeenCalled()
      expect(moz).not.toHaveBeenCalled()
    })

    it('should fall back to the moz prefix', () => {
      const moz = jest.fn()
      requestFullScreen(buildElem({ mozRequestFullScreen: moz }))
      expect(moz).toHaveBeenCalled()
    })

    it('should fall back to the webkit prefix', () => {
      const webkit = jest.fn()
      requestFullScreen(buildElem({ webkitRequestFullscreen: webkit }))
      expect(webkit).toHaveBeenCalled()
    })

    it('should fall back to the ms prefix', () => {
      const ms = jest.fn()
      requestFullScreen(buildElem({ msRequestFullscreen: ms }))
      expect(ms).toHaveBeenCalled()
    })

    it('should do nothing when no api is available', () => {
      expect(() => requestFullScreen(buildElem({}))).not.toThrow()
    })
  })

  describe('requestExitFullScreen', () => {
    it('should prefer the standard exitFullscreen', () => {
      const standard = jest.fn()
      const moz = jest.fn()
      setDoc({ exitFullscreen: standard, mozCancelFullScreen: moz })
      requestExitFullScreen()
      expect(standard).toHaveBeenCalled()
      expect(moz).not.toHaveBeenCalled()
    })

    it('should fall back to the moz prefix', () => {
      const moz = jest.fn()
      setDoc({ mozCancelFullScreen: moz })
      requestExitFullScreen()
      expect(moz).toHaveBeenCalled()
    })

    it('should fall back to the webkit prefix', () => {
      const webkit = jest.fn()
      setDoc({ webkitExitFullscreen: webkit })
      requestExitFullScreen()
      expect(webkit).toHaveBeenCalled()
    })

    it('should fall back to the ms prefix', () => {
      const ms = jest.fn()
      setDoc({ msExitFullscreen: ms })
      requestExitFullScreen()
      expect(ms).toHaveBeenCalled()
    })

    it('should do nothing when no api is available', () => {
      setDoc({})
      expect(() => requestExitFullScreen()).not.toThrow()
    })
  })

  describe('hasFullScreenSupport', () => {
    it('should report support for any available api', () => {
      expect(hasFullScreenSupport({ requestFullscreen: jest.fn() } as any)).toBe(true)
      expect(hasFullScreenSupport({ mozRequestFullScreen: jest.fn() } as any)).toBe(true)
      expect(hasFullScreenSupport({ webkitRequestFullscreen: jest.fn() } as any)).toBe(true)
      expect(hasFullScreenSupport({ msRequestFullscreen: jest.fn() } as any)).toBe(true)
    })

    it('should report no support when every api is missing', () => {
      expect(hasFullScreenSupport({} as any)).toBe(false)
    })
  })
})

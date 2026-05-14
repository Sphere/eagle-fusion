// Browser global shim for Angular SSR / prerender.
// This file is imported first in main.server.ts so global.window is defined
// before any third-party library module (socket.io, keycloak, videojs, etc.)
// runs its module-scope initialisation code in Node.js.
const globalAny = global as any

function mockElement(): any {
  const el: any = {
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
    setAttribute: () => {},
    getAttribute: () => null,
    removeAttribute: () => {},
    hasAttribute: () => false,
    appendChild: () => el,
    removeChild: () => {},
    insertBefore: () => {},
    replaceChild: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementsByTagName: () => [],
    innerHTML: '',
    textContent: '',
    src: '',
    href: '',
    canPlayType: () => '',
    play: () => Promise.resolve(),
    pause: () => {},
    load: () => {},
  }
  return el
}

if (typeof globalAny['window'] === 'undefined') {
  globalAny['window'] = {
    env: {
      name: '',
      production: false,
      sitePath: '',
      organisation: '',
      framework: '',
      channelId: '',
      azureHost: '',
      contentHost: '',
      azureBucket: '',
      azureOldHost: '',
      azureOldBuket: '',
    },
    location: {
      host: '',
      hostname: '',
      href: '',
      origin: '',
      pathname: '/',
      protocol: 'https:',
      search: '',
      hash: '',
      port: '',
    },
    navigator: { userAgent: 'node.js', language: 'en', languages: ['en'] },
    document: {
      cookie: '',
      referrer: '',
      readyState: 'complete',
      createElement: () => mockElement(),
      createElementNS: () => mockElement(),
      createTextNode: () => ({}),
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      getElementsByTagName: () => [],
      getElementsByClassName: () => [],
      body: mockElement(),
      head: mockElement(),
      documentElement: mockElement(),
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
    sessionStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    innerWidth: 1920,
    innerHeight: 1080,
    screen: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1080 },
    CustomEvent: class { constructor(_type: string, _init?: any) {} },
    Event: class { constructor(_type: string, _init?: any) {} },
    setTimeout: globalAny['setTimeout'],
    clearTimeout: globalAny['clearTimeout'],
    setInterval: globalAny['setInterval'],
    clearInterval: globalAny['clearInterval'],
    fetch: globalAny['fetch'],
    XMLHttpRequest: globalAny['XMLHttpRequest'],
    WebSocket: undefined,
    crypto: globalAny['crypto'],
    performance: globalAny['performance'],
    matchMedia: () => ({ matches: false, media: '', addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false }),
    getComputedStyle: () => ({}),
    scrollTo: () => {},
    history: { pushState: () => {}, replaceState: () => {}, go: () => {}, back: () => {}, forward: () => {} },
  }
}

// global.document is a SEPARATE object from window.document intentionally.
// video.js isReal() checks `document === window.document` — keeping them distinct
// makes isReal() return false, preventing the TEST_VID crash.
// Services that use bare `document` (e.g. BtnSettingsService) still find it here.
if (typeof globalAny['document'] === 'undefined') {
  globalAny['document'] = {
    cookie: '',
    referrer: '',
    readyState: 'complete',
    title: '',
    createElement: () => mockElement(),
    createElementNS: () => mockElement(),
    createTextNode: () => ({ textContent: '' }),
    createDocumentFragment: () => mockElement(),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByTagName: () => [],
    getElementsByClassName: () => [],
    body: mockElement(),
    head: mockElement(),
    documentElement: mockElement(),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }
}

if (typeof globalAny['location'] === 'undefined') {
  globalAny['location'] = globalAny['window']['location']
}

if (typeof globalAny['navigator'] === 'undefined') {
  globalAny['navigator'] = globalAny['window']['navigator']
}

if (typeof globalAny['localStorage'] === 'undefined') {
  globalAny['localStorage'] = globalAny['window']['localStorage']
}

if (typeof globalAny['sessionStorage'] === 'undefined') {
  globalAny['sessionStorage'] = globalAny['window']['sessionStorage']
}

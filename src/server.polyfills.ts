// Browser global shim for Angular SSR / prerender.
// This file is imported first in main.server.ts so global.window is defined
// before any third-party library module (socket.io, keycloak, videojs, etc.)
// runs its module-scope initialisation code in Node.js.
const globalAny = global as any

if (typeof globalAny['window'] === 'undefined') {
  globalAny['window'] = {
    location: {
      hostname: '',
      href: '',
      origin: '',
      pathname: '/',
      protocol: 'https:',
      search: '',
      hash: '',
    },
    navigator: { userAgent: 'node.js', language: 'en', languages: ['en'] },
    document: {
      cookie: '',
      referrer: '',
      readyState: 'complete',
      createElement: () => ({ style: {} }),
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      body: { style: {}, classList: { add: () => {}, remove: () => {} } },
      head: { appendChild: () => {}, querySelector: () => null },
      addEventListener: () => {},
      removeEventListener: () => {},
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
    matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
    getComputedStyle: () => ({}),
    scrollTo: () => {},
    history: { pushState: () => {}, replaceState: () => {}, go: () => {}, back: () => {}, forward: () => {} },
  }
}

if (typeof globalAny['document'] === 'undefined') {
  globalAny['document'] = globalAny['window']['document']
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

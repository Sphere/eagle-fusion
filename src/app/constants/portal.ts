/**
 * Portal resolution for local development.
 *
 * This repo serves both Aastrika Sphere and Ekshamata from the same codebase and
 * decides which one to render from `window.location.hostname`. On localhost that
 * is always "localhost", so the app can only ever be Sphere — which is why
 * testing Ekshamata locally meant editing the hostname checks by hand.
 *
 * `getPortalHost()` returns the hostname the app should treat itself as. On a
 * real domain it returns `window.location.hostname` unchanged, so deployed
 * behaviour is identical. On localhost only, it honours an override:
 *
 *   http://localhost:3000/page/home?portal=ekshamata   → switch and remember
 *   http://localhost:3000/page/home?portal=sphere      → switch back
 *   http://localhost:3000/page/home?portal=reset       → clear the override
 *
 * The choice is stored in localStorage, so it survives navigation and reloads —
 * pass the query param once, then browse normally.
 *
 * Note this only changes what the *frontend* believes it is (layout, titles,
 * footer). Config and content still come from whichever host the dev proxy
 * points at, so pair it with `yarn start:ekshamata`.
 */

const STORAGE_KEY = 'devPortalHost'

const PRESETS: { [key: string]: string } = {
  ekshamata: 'ekshamata.aastrika.org',
  sphere: 'sphere.aastrika.org',
}

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]', '::1']

export function getPortalHost(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const actualHost = window.location.hostname

  // Never let a query param change a deployed environment.
  if (!LOCAL_HOSTS.includes(actualHost)) {
    return actualHost
  }

  try {
    const requested = new URLSearchParams(window.location.search).get('portal')
    if (requested === 'reset') {
      localStorage.removeItem(STORAGE_KEY)
    } else if (requested) {
      localStorage.setItem(STORAGE_KEY, PRESETS[requested.toLowerCase()] || requested)
    }

    const override = localStorage.getItem(STORAGE_KEY)
    if (override) {
      return override
    }
  } catch {
    // localStorage can throw in private mode / blocked storage — fall through
  }

  return actualHost
}

export function isEkshamataPortal(): boolean {
  return getPortalHost().includes('ekshamata')
}

import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone'

setupZoneTestEnv()

// videojs-markers calls the deprecated videojs.plugin() as a side effect of being imported
// (see player-video.component.ts), which logs a console.warn on every spec that transitively
// pulls in that component (e.g. via the collection/app public-api barrels). Stub it globally —
// no spec exercises the markers plugin itself, only player-video.component.spec.ts mocks it locally.
jest.mock('videojs-markers', () => ({}))

Object.defineProperty(window, 'fcWidget', {
  value: {
    init: jest.fn(),
    setConfig: jest.fn(),
    open: jest.fn(),
    show: jest.fn(),
  },
  writable: true,
})

// Stub URL.createObjectURL so specs that load ngx-image-cropper (via the full
// utils/src/public-api barrel) do not crash in jsdom.
if (typeof URL.createObjectURL === 'undefined') {
  Object.defineProperty(URL, 'createObjectURL', { value: jest.fn() })
}

// Stub Angular's $localize so component templates that use i18n tags compile
// without a full Angular localisation setup.
;(globalThis as any).$localize = (chunks: TemplateStringsArray, ...expressions: any[]): string =>
  chunks.reduce((result, chunk, i) => result + (expressions[i - 1] ?? '') + chunk)
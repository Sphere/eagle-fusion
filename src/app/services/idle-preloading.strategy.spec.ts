import { of } from 'rxjs'
import { IdlePreloadingStrategy } from './idle-preloading.strategy'

describe('IdlePreloadingStrategy', () => {
  let strategy: IdlePreloadingStrategy

  beforeEach(() => {
    jest.useFakeTimers()
    strategy = new IdlePreloadingStrategy()
    delete (window as any).requestIdleCallback
    Object.defineProperty(navigator, 'connection', { value: undefined, configurable: true })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const flush = async (ms: number) => {
    jest.advanceTimersByTime(ms)
    // let the idle promise and the mergeMap chain settle
    for (let i = 0; i < 5; i++) {
      await Promise.resolve()
    }
    jest.advanceTimersByTime(250)
    for (let i = 0; i < 5; i++) {
      await Promise.resolve()
    }
  }

  it('does not load before the start delay', async () => {
    const load = jest.fn(() => of('module'))
    strategy.preload({ path: 'a' }, load).subscribe()
    await flush(IdlePreloadingStrategy.START_DELAY_MS - 500)
    expect(load).not.toHaveBeenCalled()
  })

  it('loads after the start delay once the browser is idle', async () => {
    const load = jest.fn(() => of('module'))
    const results: any[] = []
    strategy.preload({ path: 'a' }, load).subscribe(r => results.push(r))
    await flush(IdlePreloadingStrategy.START_DELAY_MS)
    expect(load).toHaveBeenCalledTimes(1)
    expect(results).toEqual(['module'])
  })

  it('staggers later preloads instead of starting them together', async () => {
    const first = jest.fn(() => of(1))
    const second = jest.fn(() => of(2))
    strategy.preload({ path: 'a' }, first).subscribe()
    strategy.preload({ path: 'b' }, second).subscribe()
    await flush(IdlePreloadingStrategy.START_DELAY_MS)
    expect(first).toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
    await flush(IdlePreloadingStrategy.STAGGER_MS)
    expect(second).toHaveBeenCalled()
  })

  it('skips routes that opt out with data.preload = false', async () => {
    const load = jest.fn(() => of('module'))
    strategy.preload({ path: 'a', data: { preload: false } }, load).subscribe()
    await flush(IdlePreloadingStrategy.START_DELAY_MS + 1000)
    expect(load).not.toHaveBeenCalled()
  })

  it('skips preloading when the user asked the browser to save data', async () => {
    Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true })
    const load = jest.fn(() => of('module'))
    strategy.preload({ path: 'a' }, load).subscribe()
    await flush(IdlePreloadingStrategy.START_DELAY_MS + 1000)
    expect(load).not.toHaveBeenCalled()
  })

  it('swallows a failed chunk download', async () => {
    const { throwError } = require('rxjs')
    const load = jest.fn(() => throwError(() => new Error('chunk failed')))
    const errors: any[] = []
    strategy.preload({ path: 'a' }, load).subscribe({ error: e => errors.push(e) })
    await flush(IdlePreloadingStrategy.START_DELAY_MS)
    expect(load).toHaveBeenCalled()
    expect(errors).toEqual([])
  })
})

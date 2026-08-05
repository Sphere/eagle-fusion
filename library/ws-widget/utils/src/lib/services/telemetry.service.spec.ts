import { Subject } from 'rxjs'
import { of, throwError } from 'rxjs'
import { TelemetryService } from './telemetry.service'
import { WsEvents } from './event.model'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'

describe('TelemetryService', () => {
  let service: TelemetryService
  let mockHttp: any
  let configSvc: any
  let configCacheSvc: any
  let eventsSvc: any
  let logger: any
  let userAgentSvc: any
  let events$: Subject<any>
  let $t: any

  const buildInstanceConfig = () => ({
    telemetryConfig: {
      pdata: { id: 'pdata-id', ver: '1.0' },
      channel: 'default-channel',
      env: 'public',
    },
  })

  const build = (instanceConfig: any = buildInstanceConfig()) => {
    configSvc.instanceConfig = instanceConfig
    return new TelemetryService(mockHttp, configSvc, configCacheSvc, eventsSvc, logger, userAgentSvc)
  }

  beforeEach(() => {
    events$ = new Subject<any>()
    $t = {
      interact: jest.fn(),
      impression: jest.fn(),
      start: jest.fn(),
      end: jest.fn(),
      audit: jest.fn(),
      heartbeat: jest.fn(),
      search: jest.fn(),
    }
    ;(globalThis as any).$t = $t

    localStorage.setItem('telemetrySessionId', 'sid-123')

    mockHttp = { post: jest.fn().mockReturnValue(of({ ok: true })) }
    configSvc = {
      instanceConfig: null,
      userProfile: { userId: 'u1', rootOrgId: 'root-1' },
    }
    configCacheSvc = { getHostConfig: jest.fn().mockReturnValue(of(buildInstanceConfig())) }
    eventsSvc = { events$ }
    logger = { error: jest.fn(), log: jest.fn(), warn: jest.fn(), info: jest.fn() }
    userAgentSvc = {
      getUserAgent: jest.fn().mockReturnValue({ browserName: 'Chrome', OS: 'Windows' }),
      generateCookie: jest.fn().mockReturnValue('cookie-1'),
      getUtmParams: jest.fn().mockReturnValue({}),
      getDeviceModel: jest.fn().mockReturnValue('Pixel'),
      getStoredGeolocation: jest.fn().mockReturnValue(null),
    }

    window.history.pushState({}, '', '/app/toc/content-1')
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('construction', () => {
    it('should create and seed telemetryConfig from the instance config', () => {
      service = build()
      expect(service).toBeTruthy()
      expect(service.telemetryConfig.pdata.pid).toBe(navigator.userAgent)
      expect(service.telemetryConfig.channel).toBe('root-1')
      expect(service.telemetryConfig.uid).toBe('u1')
      expect(service.telemetryConfig.sid).toBe('sid-123')
      expect(service.pData).toBe(service.telemetryConfig.pdata)
    })

    it('should fall back to the configured channel when the profile has no rootOrgId', () => {
      configSvc.userProfile = { userId: 'u1' }
      service = build()
      expect(service.telemetryConfig.channel).toBe('default-channel')
    })

    it('should leave telemetryConfig unset when there is no instance config', () => {
      service = build(null)
      expect(service.telemetryConfig).toBeNull()
      expect(service.pData).toBeNull()
    })
  })

  describe('getTelemetrySessionId', () => {
    it('should read the session id from localStorage', () => {
      service = build()
      expect(service.getTelemetrySessionId).toBe('sid-123')
    })

    it('should return an empty string when no session id is stored', () => {
      localStorage.removeItem('telemetrySessionId')
      service = build()
      expect(service.getTelemetrySessionId).toBe('')
    })
  })

  describe('rootOrgId', () => {
    it('should return the profile rootOrgId', () => {
      service = build()
      expect(service.rootOrgId).toBe('root-1')
    })

    it('should return an empty string when the profile is missing', () => {
      service = build()
      service.configSvc.userProfile = null
      expect(service.rootOrgId).toBe('')
    })
  })

  describe('interact', () => {
    it('should forward an enriched edata payload to $t.interact', () => {
      service = build()
      $t.interact.mockClear()
      service.interact('click', 'play', 'page-1', { id: 'obj' }, { id: 'actor' }, { k: 'v' })

      expect($t.interact).toHaveBeenCalledTimes(1)
      const [edata, config] = $t.interact.mock.calls[0]
      expect(edata).toEqual(expect.objectContaining({
        type: 'click',
        mode: 'play',
        pageid: 'page-1',
        extras: { k: 'v' },
        browserName: 'Chrome',
        OS: 'Windows',
        cookie: 'cookie-1',
      }))
      expect(config.actor).toEqual({ id: 'actor' })
      expect(config.object).toEqual({ id: 'obj' })
      expect(config.context.pdata.id).toBe('web-ui')
      expect(config.context.sid).toBe('sid-123')
    })

    it('should default actor and object to empty objects', () => {
      service = build()
      $t.interact.mockClear()
      service.interact('click', 'play', 'page-1')
      const [, config] = $t.interact.mock.calls[0]
      expect(config.actor).toEqual({})
      expect(config.object).toEqual({})
    })

    it('should log an error when the config is missing', () => {
      service = build(null)
      service.interact('click', 'play', 'page-1')
      expect(logger.error).toHaveBeenCalledWith('Error Initializing Telemetry. Config missing.')
      expect($t.interact).not.toHaveBeenCalled()
    })

    it('should swallow and log an error thrown by $t', () => {
      service = build()
      $t.interact.mockImplementation(() => { throw new Error('boom') })
      expect(() => service.interact('click', 'play', 'page-1')).not.toThrow()
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry interact', expect.any(Error))
    })
  })

  describe('interactForLogin', () => {
    it('should post an INTERACT envelope to the public telemetry endpoint', async () => {
      service = build()
      service.interactForLogin('click', 'login', 'page-1', { id: 'a1', type: 'User' }, { subtype: 'st' })
      await Promise.resolve()

      expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.PUBLIC_TELEMETRY, expect.any(Object))
      const body = mockHttp.post.mock.calls[0][1]
      expect(body.events[0].eid).toBe('INTERACT')
      expect(body.events[0].actor).toEqual({ id: 'a1', type: 'User' })
      expect(body.events[0].context.cdata).toEqual([{ id: 'a1', type: 'User' }])
      expect(body.events[0].edata.subtype).toBe('st')
    })

    it('should include only the utm params that are present', () => {
      userAgentSvc.getUtmParams.mockReturnValue({ utm_source: 'google', utm_medium: null })
      service = build()
      service.interactForLogin('click', 'login', 'page-1')

      const { edata } = mockHttp.post.mock.calls[0][1].events[0]
      expect(edata.utm_source).toBe('google')
      expect(edata).not.toHaveProperty('utm_medium')
    })

    it('should include every utm param when all are present', () => {
      userAgentSvc.getUtmParams.mockReturnValue({
        utm_source: 's', utm_medium: 'm', utm_campaign: 'c', utm_content: 'co', utm_term: 't',
      })
      service = build()
      service.interactForLogin('click', 'login', 'page-1')

      const { edata } = mockHttp.post.mock.calls[0][1].events[0]
      expect(edata).toEqual(expect.objectContaining({
        utm_source: 's', utm_medium: 'm', utm_campaign: 'c', utm_content: 'co', utm_term: 't',
      }))
    })

    it('should default the actor cdata entry when no actor is given', () => {
      service = build()
      service.interactForLogin('click', 'login', 'page-1')
      expect(mockHttp.post.mock.calls[0][1].events[0].context.cdata).toEqual([{ id: '', type: '' }])
    })

    it('should log an error when the config is missing', () => {
      service = build(null)
      service.interactForLogin('click', 'login', 'page-1')
      expect(logger.error).toHaveBeenCalledWith('Error Initializing Telemetry. Config missing.')
      expect(mockHttp.post).not.toHaveBeenCalled()
    })

    it('should swallow and log an error raised while building the payload', () => {
      service = build()
      userAgentSvc.getUserAgent.mockImplementation(() => { throw new Error('ua down') })
      expect(() => service.interactForLogin('click', 'login', 'page-1')).not.toThrow()
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry interactForLogin', expect.any(Error))
    })
  })

  describe('impression', () => {
    it('should forward an impression payload to $t.impression', async () => {
      service = build()
      $t.impression.mockClear()
      service.impression('view', 'detail', 'page-1', { id: 'obj' })
      await Promise.resolve()

      const [edata, config] = $t.impression.mock.calls[0]
      expect(edata).toEqual(expect.objectContaining({
        type: 'view', subtype: 'detail', pageid: 'page-1', browserName: 'Chrome', OS: 'Windows',
      }))
      expect(config.object).toEqual({ id: 'obj' })
      expect(config.context.pdata.pid).toBe('sphere.aastrika.org')
    })

    it('should default the object to an empty object', () => {
      service = build()
      $t.impression.mockClear()
      service.impression('view', 'detail', 'page-1')
      expect($t.impression.mock.calls[0][1].object).toEqual({})
    })

    it('should log an error when the config is missing', () => {
      // impression() kicks off getTelemetryConfig() without awaiting it, so the synchronous
      // guard still sees the null config from construction.
      service = build(null)
      service.impression('view', 'detail', 'page-1')
      expect(logger.error).toHaveBeenCalledWith('Error Initializing Telemetry. Config missing.')
    })

    it('should swallow and log an error thrown by $t', () => {
      service = build()
      $t.impression.mockImplementation(() => { throw new Error('boom') })
      expect(() => service.impression('view', 'detail', 'page-1')).not.toThrow()
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry impression', expect.any(Error))
    })
  })

  describe('start / end / audit / heartbeat', () => {
    it('should call $t.start with the telemetry config and edata', () => {
      service = build()
      service.start('player', 'play', 'id-1', { id: 'obj' }, { e: 1 })
      const [config, id, ver, edata, options] = $t.start.mock.calls[0]
      expect(config).toBe(service.telemetryConfig)
      expect(id).toBe('id-1')
      expect(ver).toBe('1.0')
      expect(edata).toEqual({ type: 'player', mode: 'play', pageid: 'id-1', extras: { e: 1 } })
      expect(options.object).toEqual({ id: 'obj' })
    })

    it('should log an error from start when the config is missing', () => {
      service = build(null)
      service.start('player', 'play', 'id-1')
      expect(logger.error).toHaveBeenCalledWith('Error Initializing Telemetry. Config missing.')
      expect($t.start).not.toHaveBeenCalled()
    })

    it('should swallow and log an error thrown by $t.start', () => {
      service = build()
      $t.start.mockImplementation(() => { throw new Error('boom') })
      expect(() => service.start('player', 'play', 'id-1')).not.toThrow()
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry start', expect.any(Error))
    })

    it('should call $t.end with the edata and context', () => {
      service = build()
      service.end('player', 'play', 'id-1', { id: 'obj' }, { e: 1 })
      const [edata, options] = $t.end.mock.calls[0]
      expect(edata).toEqual({ type: 'player', mode: 'play', pageid: 'id-1', extras: { e: 1 } })
      expect(options.object).toEqual({ id: 'obj' })
      expect(options.context.sid).toBe('sid-123')
    })

    it('should swallow and log an error thrown by $t.end', () => {
      service = build()
      $t.end.mockImplementation(() => { throw new Error('boom') })
      expect(() => service.end('player', 'play', 'id-1')).not.toThrow()
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry end', expect.any(Error))
    })

    it('should call $t.audit with the state and empty prevstate', () => {
      service = build()
      service.audit('update', 'name', { name: 'x' })
      const [edata] = $t.audit.mock.calls[0]
      expect(edata).toEqual({
        type: 'update', props: 'name', state: { name: 'x' }, prevstate: '', duration: '',
      })
    })

    it('should swallow and log an error thrown by $t.audit', () => {
      service = build()
      $t.audit.mockImplementation(() => { throw new Error('boom') })
      expect(() => service.audit('update', 'name', {})).not.toThrow()
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry audit', expect.any(Error))
    })

    it('should call $t.heartbeat with the id and type', () => {
      service = build()
      $t.heartbeat.mockClear()
      service.heartbeat('player', 'id-1')
      expect($t.heartbeat).toHaveBeenCalledWith({ id: 'id-1', type: 'player' })
    })

    it('should swallow and log an error thrown by $t.heartbeat', () => {
      service = build()
      $t.heartbeat.mockImplementation(() => { throw new Error('boom') })
      expect(() => service.heartbeat('player', 'id-1')).not.toThrow()
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry heartbeat', expect.any(Error))
    })
  })

  describe('getTelemetryConfig', () => {
    it('should refresh telemetryConfig and pData from the cached host config', async () => {
      service = build()
      service.telemetryConfig = null
      await service.getTelemetryConfig()
      expect(configCacheSvc.getHostConfig).toHaveBeenCalled()
      expect(service.telemetryConfig.channel).toBe('root-1')
      expect(service.telemetryConfig.pdata.pid).toBe(navigator.userAgent)
      expect(service.pData).toEqual({ id: 'pdata-id', ver: '1.0' })
    })
  })

  describe('publicImpression', () => {
    it('should post a PUBLICIMPRESSION envelope merged with the parsed param', async () => {
      service = build()
      await service.publicImpression('{"custom":"yes"}', 'Firefox', 'Linux')

      const body = mockHttp.post.mock.calls.find((c: any[]) => c[1].events[0].eid === 'PUBLICIMPRESSION')[1]
      expect(body.events[0].actor).toEqual({ id: 'anonymous', type: 'User' })
      expect(body.events[0].edata).toEqual(expect.objectContaining({
        browserName: 'Firefox', OS: 'Linux', custom: 'yes', cookie: 'cookie-1',
      }))
      expect(service.previousUrl).toBe('app/toc/content-1')
    })

    it('should log an error when the param is not valid json', async () => {
      service = build()
      await service.publicImpression('not-json', 'Firefox', 'Linux')
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry publicImpression', expect.any(Error))
    })
  })

  describe('paramTriggerStart / paramTriggerEnd', () => {
    const eparams = { type: 'player', mode: 'play', pageid: 'p1', duration: 10 }
    const user = { userId: 'u1' }
    const rollup = { l1: 'a' }

    it('should post a START envelope carrying the rollup', async () => {
      service = build()
      await service.paramTriggerStart('{"extra":1}', 'Chrome', 'Windows', eparams, user, rollup)

      const body = mockHttp.post.mock.calls[0][1]
      expect(body.events[0].eid).toBe('START')
      expect(body.events[0].actor).toEqual({ id: 'u1', type: 'User' })
      expect(body.events[0].context.rollup).toEqual(rollup)
      expect(body.events[0].object.rollup).toEqual(rollup)
      expect(body.events[0].edata).toEqual(expect.objectContaining({ type: 'player', duration: 10, extra: 1 }))
      expect(service.previousUrl).toBe('app/toc/content-1')
    })

    it('should post an END envelope carrying the rollup', async () => {
      service = build()
      await service.paramTriggerEnd('{"extra":2}', 'Chrome', 'Windows', eparams, user, rollup)

      const body = mockHttp.post.mock.calls[0][1]
      expect(body.events[0].eid).toBe('END')
      expect(body.events[0].edata.extra).toBe(2)
    })

    it('should log an error when the start param is not valid json', async () => {
      service = build()
      await service.paramTriggerStart('nope', 'Chrome', 'Windows', eparams, user, rollup)
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry paramTriggerStart', expect.any(Error))
    })

    it('should log an error when the end param is not valid json', async () => {
      service = build()
      await service.paramTriggerEnd('nope', 'Chrome', 'Windows', eparams, user, rollup)
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry paramTriggerEnd', expect.any(Error))
    })
  })

  describe('registrationInteract', () => {
    const actor = { id: 'guest-1', type: 'Guest' }
    const edata = { type: 'click', subtype: 'submit', id: 'btn', pageid: 'signup' }

    it('should post an INTERACT envelope with the base context values', () => {
      service = build()
      service.registrationInteract(actor, 'signup-env', edata)

      const body = mockHttp.post.mock.calls[0][1]
      expect(body.events[0].actor).toEqual(actor)
      expect(body.events[0].context.env).toBe('signup-env')
      expect(body.events[0].context.did).toBe('cookie-1')
      expect(body.events[0].context.cdata).toEqual([{ id: 'sid-123', type: 'Guest user' }])
      expect(body.events[0].object).toEqual({ id: '', type: '', version: '', rollup: {} })
      expect(body.events[0].edata.extra.values).toEqual([
        { browserName: 'Chrome' },
        { OS: 'Windows' },
        { deviceModel: 'Pixel' },
      ])
    })

    it('should carry the supplied object through', () => {
      service = build()
      const object = { id: 'o1', type: 'Content', version: '1.0', rollup: { l1: 'x' } }
      service.registrationInteract(actor, 'env', edata, object)
      expect(mockHttp.post.mock.calls[0][1].events[0].object).toEqual(object)
    })

    it('should append every populated user-context value', () => {
      userAgentSvc.getStoredGeolocation.mockReturnValue({ latitude: 1, longitude: 2, accuracy: 3 })
      service = build()
      service.registrationInteract(actor, 'env', edata, undefined, {
        referrer: 'google.com',
        screenWidth: 1920,
        screenHeight: 1080,
        language: 'en',
        utmParams: { utm_source: 's', utm_campaign: 'c' },
      })

      const values = mockHttp.post.mock.calls[0][1].events[0].edata.extra.values
      expect(values).toEqual(expect.arrayContaining([
        { referrer: 'google.com' },
        { screenWidth: 1920, screenHeight: 1080 },
        { language: 'en' },
        { utm_source: 's' },
        { utm_campaign: 'c' },
        { latitude: 1, longitude: 2, geoAccuracy: 3 },
      ]))
      expect(values).not.toContainEqual({ utm_medium: expect.anything() })
    })

    it('should omit the deviceModel entry when the device model is unknown', () => {
      userAgentSvc.getDeviceModel.mockReturnValue(null)
      service = build()
      service.registrationInteract(actor, 'env', edata)
      const values = mockHttp.post.mock.calls[0][1].events[0].edata.extra.values
      expect(values.some((v: any) => 'deviceModel' in v)).toBe(false)
    })

    it('should preserve caller-supplied extra values ahead of the context values', () => {
      service = build()
      service.registrationInteract(actor, 'env', {
        ...edata,
        extra: { pos: [{ x: 1 }], values: [{ mine: true }] },
      })
      const { extra } = mockHttp.post.mock.calls[0][1].events[0].edata
      expect(extra.pos).toEqual([{ x: 1 }])
      expect(extra.values[0]).toEqual({ mine: true })
    })

    it('should log an error when the config is missing', () => {
      service = build(null)
      service.registrationInteract(actor, 'env', edata)
      expect(logger.error).toHaveBeenCalledWith('Error Initializing Telemetry. Config missing.')
      expect(mockHttp.post).not.toHaveBeenCalled()
    })

    it('should swallow and log an error raised while building the payload', () => {
      service = build()
      userAgentSvc.getUserAgent.mockImplementation(() => { throw new Error('ua down') })
      expect(() => service.registrationInteract(actor, 'env', edata)).not.toThrow()
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry registrationInteract', expect.any(Error))
    })
  })

  describe('postPublicTelemetry', () => {
    it('should post to the public telemetry endpoint', async () => {
      service = build()
      await service.postPublicTelemetry({ id: 'x' } as any)
      expect(mockHttp.post).toHaveBeenCalledWith(API_END_POINTS.PUBLIC_TELEMETRY, { id: 'x' })
    })

    it('should log and resolve when the post fails', async () => {
      mockHttp.post.mockReturnValue(throwError(() => new Error('network')))
      service = build()
      await expect(service.postPublicTelemetry({ id: 'x' } as any)).resolves.toBeUndefined()
      expect(logger.error).toHaveBeenCalledWith('Error posting telemetry', expect.any(Error))
    })
  })

  describe('paramTriggerImpression', () => {
    it('should attach the object id when the url carries a content id', async () => {
      service = build()
      $t.impression.mockClear()
      await service.paramTriggerImpression('{"a":1}', 'Chrome', 'Windows')

      const [edata, config] = $t.impression.mock.calls[0]
      expect(edata).toEqual(expect.objectContaining({ a: 1, browserName: 'Chrome', OS: 'Windows' }))
      expect(config.object).toEqual({ id: 'content-1' })
    })

    it('should omit the object when the url carries no content id', async () => {
      window.history.pushState({}, '', '/app/home')
      service = build()
      $t.impression.mockClear()
      await service.paramTriggerImpression('{"a":1}', 'Chrome', 'Windows')

      expect($t.impression.mock.calls[0][1].object).toBeUndefined()
      expect(service.previousUrl).toBe('app/home')
    })

    it('should log an error when the param is not valid json', async () => {
      service = build()
      await service.paramTriggerImpression('nope', 'Chrome', 'Windows')
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry paramTriggerImpression', expect.any(Error))
    })
  })

  describe('externalImpression', () => {
    it('should raise an impression for a registered external app with an object id', () => {
      service = build()
      $t.impression.mockClear()
      service.externalImpression({ subApplicationName: 'RBCP', data: { type: 'view' } } as any)

      const [data, config] = $t.impression.mock.calls[0]
      expect(data).toEqual({ type: 'view' })
      expect(config.context.pdata.id).toBe('rbcp-web-ui')
      expect(config.object).toEqual({ id: 'content-1' })
    })

    it('should omit the object when the url carries no content id', () => {
      window.history.pushState({}, '', '/app/home')
      service = build()
      $t.impression.mockClear()
      service.externalImpression({ subApplicationName: 'RBCP', data: {} } as any)
      expect($t.impression.mock.calls[0][1].object).toBeUndefined()
    })

    it('should ignore an unregistered external app', () => {
      service = build()
      $t.impression.mockClear()
      service.externalImpression({ subApplicationName: 'UNKNOWN', data: {} } as any)
      expect($t.impression).not.toHaveBeenCalled()
    })

    it('should swallow and log an error thrown by $t', () => {
      service = build()
      $t.impression.mockImplementation(() => { throw new Error('boom') })
      expect(() => service.externalImpression({ subApplicationName: 'RBCP', data: {} } as any)).not.toThrow()
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry externalImpression', expect.any(Error))
    })
  })

  describe('addPlayerListener', () => {
    const playerEvent = (state: string, extra: any = {}) => ({
      eventType: WsEvents.WsEventType.Telemetry,
      data: {
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        state,
        identifier: 'c1',
        object: { id: 'c1' },
        isIframeSupported: 'Yes',
        ...extra,
      },
    })

    it('should start telemetry on a Loaded player event', () => {
      service = build()
      service.addPlayerListener()
      events$.next(playerEvent(WsEvents.EnumTelemetrySubType.Loaded))
      expect($t.start).toHaveBeenCalled()
    })

    it('should end telemetry on an Unloaded player event', () => {
      service = build()
      service.addPlayerListener()
      events$.next(playerEvent(WsEvents.EnumTelemetrySubType.Unloaded))
      expect($t.end).toHaveBeenCalled()
    })

    it('should honour a "maybe" iframe support value', () => {
      service = build()
      service.addPlayerListener()
      events$.next(playerEvent(WsEvents.EnumTelemetrySubType.Loaded, { isIframeSupported: 'Maybe' }))
      expect($t.start).toHaveBeenCalled()
    })

    it('should ignore events that are not player time-spent events', () => {
      service = build()
      service.addPlayerListener()
      $t.start.mockClear()
      events$.next({
        eventType: WsEvents.WsEventType.Telemetry,
        data: { type: 'other', mode: 'play', state: WsEvents.EnumTelemetrySubType.Loaded },
      })
      expect($t.start).not.toHaveBeenCalled()
    })
  })

  describe('addInteractListener', () => {
    const interactEvent = (from: string, data: any = {}) => ({
      eventType: WsEvents.WsEventType.Telemetry,
      from,
      data: {
        eventSubType: WsEvents.EnumTelemetrySubType.Interact,
        type: 'click',
        subType: 'tap',
        pageid: 'p1',
        extras: { a: 1 },
        object: { id: 'o1' },
        ...data,
      },
    })

    it('should route an external app event through the external pdata id', () => {
      service = build()
      $t.interact.mockClear()
      events$.next(interactEvent('RBCP'))
      expect($t.interact.mock.calls[0][1].context.pdata.id).toBe('rbcp-web-ui')
    })

    it('should route a local event through the default pdata id', () => {
      service = build()
      $t.interact.mockClear()
      events$.next(interactEvent('local'))
      const [edata, config] = $t.interact.mock.calls[0]
      expect(edata).toEqual({ type: 'click', mode: 'tap', pageid: 'p1', extras: { a: 1 } })
      expect(config.context.pdata.id).toBe('pdata-id')
      expect(config.object).toEqual({ id: 'o1' })
    })

    it('should fall back to the current page id when the event carries none', () => {
      service = build()
      $t.interact.mockClear()
      events$.next(interactEvent('local', { pageid: undefined }))
      expect($t.interact.mock.calls[0][0].pageid).toBe('app/toc/content-1')
    })

    it('should log an error when $t throws for an external event', () => {
      service = build()
      $t.interact.mockImplementation(() => { throw new Error('boom') })
      events$.next(interactEvent('RBCP'))
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry interact', expect.any(Error))
    })

    it('should log an error when $t throws for a local event', () => {
      service = build()
      $t.interact.mockImplementation(() => { throw new Error('boom') })
      events$.next(interactEvent('local'))
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry interact', expect.any(Error))
    })

    it('should ignore events of a different sub type', () => {
      service = build()
      $t.interact.mockClear()
      events$.next(interactEvent('local', { eventSubType: WsEvents.EnumTelemetrySubType.Search }))
      expect($t.interact).not.toHaveBeenCalled()
    })
  })

  describe('addHearbeatListener', () => {
    const heartbeatEvent = (from: string, data: any = {}) => ({
      eventType: WsEvents.WsEventType.Telemetry,
      from,
      data: {
        eventSubType: WsEvents.EnumTelemetrySubType.HeartBeat,
        type: 'player',
        identifier: 'c1',
        ...data,
      },
    })

    it('should route an external app heartbeat through the external pdata id', () => {
      service = build()
      $t.heartbeat.mockClear()
      events$.next(heartbeatEvent('RBCP'))
      expect($t.heartbeat.mock.calls[0][1].context.pdata.id).toBe('rbcp-web-ui')
    })

    it('should route a local heartbeat through the default pdata id', () => {
      service = build()
      $t.heartbeat.mockClear()
      events$.next(heartbeatEvent('local'))
      const [data, config] = $t.heartbeat.mock.calls[0]
      expect(data).toEqual({ type: 'player', identifier: 'c1' })
      expect(config.context.pdata.id).toBe('pdata-id')
    })

    it('should log an error when $t throws for an external heartbeat', () => {
      service = build()
      $t.heartbeat.mockImplementation(() => { throw new Error('boom') })
      events$.next(heartbeatEvent('RBCP'))
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry heartbeat', expect.any(Error))
    })

    it('should log an error when $t throws for a local heartbeat', () => {
      service = build()
      $t.heartbeat.mockImplementation(() => { throw new Error('boom') })
      events$.next(heartbeatEvent('local'))
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry heartbeat', expect.any(Error))
    })
  })

  describe('addSearchListener', () => {
    const searchEvent = () => ({
      eventType: WsEvents.WsEventType.Telemetry,
      data: {
        eventSubType: WsEvents.EnumTelemetrySubType.Search,
        query: 'nursing',
        filters: { topic: 'x' },
        size: 10,
      },
    })

    it('should forward the query, filters and size to $t.search', () => {
      service = build()
      $t.search.mockClear()
      events$.next(searchEvent())
      expect($t.search.mock.calls[0][0]).toEqual({ query: 'nursing', filters: { topic: 'x' }, size: 10 })
    })

    it('should log an error when $t.search throws', () => {
      service = build()
      $t.search.mockImplementation(() => { throw new Error('boom') })
      events$.next(searchEvent())
      expect(logger.error).toHaveBeenCalledWith('Error in telemetry search', expect.any(Error))
    })
  })

  describe('getPageDetails', () => {
    it('should derive the page id, url and parts from the location', () => {
      window.history.pushState({}, '', '/app/toc/content-1?tab=overview')
      service = build()
      service.previousUrl = 'prev'
      const page = service.getPageDetails()
      expect(page.pageid).toBe('app/toc/content-1')
      expect(page.pageUrl).toBe('app/toc/content-1?tab=overview')
      expect(page.pageUrlParts).toEqual(['app', 'toc', 'content-1'])
      expect(page.refferUrl).toBe('prev')
      expect(page.objectId).toBe('content-1')
    })
  })

  describe('extractContentIdFromUrlParts', () => {
    beforeEach(() => {
      service = build()
    })

    it('should return null when neither toc nor viewer is present', () => {
      expect(service.extractContentIdFromUrlParts(['app', 'home'])).toBeNull()
    })

    it('should return the segment after toc', () => {
      expect(service.extractContentIdFromUrlParts(['app', 'toc', 'c1'])).toBe('c1')
    })

    it('should return null when toc is the last segment', () => {
      expect(service.extractContentIdFromUrlParts(['app', 'toc'])).toBeNull()
    })

    it('should return the second segment after viewer', () => {
      expect(service.extractContentIdFromUrlParts(['app', 'viewer', 'pdf', 'c1'])).toBe('c1')
    })

    it('should return null when viewer has too few trailing segments', () => {
      expect(service.extractContentIdFromUrlParts(['app', 'viewer', 'pdf'])).toBeNull()
    })

    it('should prefer toc over viewer when both are present', () => {
      expect(service.extractContentIdFromUrlParts(['toc', 'c1', 'viewer', 'pdf', 'c2'])).toBe('c1')
    })
  })
})

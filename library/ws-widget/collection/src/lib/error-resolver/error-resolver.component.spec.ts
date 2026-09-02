import { ErrorResolverComponent } from './error-resolver.component'

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('ErrorResolverComponent', () => {
  let component: ErrorResolverComponent
  let mockConfigService: any
  let mockErrorResolverSvc: any
  let mockActivateRoute: any

  beforeEach(() => {
    mockConfigService = {
      instanceConfig: {
        defaultFeatureConfigs: { error: '/config/error.json' },
      },
    }
    mockErrorResolverSvc = {
      getErrorConfig: jest.fn().mockResolvedValue({
        accessForbidden: { a: 1 },
        contentUnavailable: { a: 2 },
        featureDisabled: { a: 3 },
        featureUnavailable: { a: 4 },
        internalServer: { a: 5 },
        notFound: { a: 6 },
        serviceUnavailable: { a: 7 },
        somethingsWrong: { a: 8 },
      }),
    }
    mockActivateRoute = {
      snapshot: { data: { errorType: 'notFound' } },
    }
    component = new ErrorResolverComponent(mockConfigService, mockErrorResolverSvc, mockActivateRoute)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should build widgetData from the route when not provided', async () => {
      component.widgetData = undefined as any
      component.ngOnInit()
      await flush()
      expect(component.widgetData.errorType).toBe('notFound')
      expect(component.widgetData.errorData).toEqual({ a: 6 })
    })

    it('should use existing widgetData when provided', async () => {
      component.widgetData = { errorType: 'internalServer' }
      component.ngOnInit()
      await flush()
      expect(component.widgetData.errorData).toEqual({ a: 5 })
    })

    it('should not fetch error config when errorData already present', async () => {
      component.widgetData = { errorType: 'internalServer', errorData: { existing: true } as any }
      component.ngOnInit()
      await flush()
      expect(mockErrorResolverSvc.getErrorConfig).not.toHaveBeenCalled()
      expect(component.widgetData.errorData).toEqual({ existing: true })
    })

    it('should not fetch error config when instanceConfig is missing', async () => {
      mockConfigService.instanceConfig = null
      component.widgetData = { errorType: 'internalServer' }
      component.ngOnInit()
      await flush()
      expect(mockErrorResolverSvc.getErrorConfig).not.toHaveBeenCalled()
    })

    it('should use errorDataPath when provided instead of default config path', async () => {
      component.widgetData = { errorType: 'internalServer', errorDataPath: '/custom/path.json' }
      component.ngOnInit()
      await flush()
      expect(mockErrorResolverSvc.getErrorConfig).toHaveBeenCalledWith('/custom/path.json')
    })

    it.each([
      ['accessForbidden', { a: 1 }],
      ['contentUnavailable', { a: 2 }],
      ['featureDisabled', { a: 3 }],
      ['featureUnavailable', { a: 4 }],
      ['internalServer', { a: 5 }],
      ['notFound', { a: 6 }],
      ['serviceUnavailable', { a: 7 }],
      ['somethingsWrong', { a: 8 }],
    ])('should resolve errorData for errorType %s', async (errorType, expected) => {
      component.widgetData = { errorType: errorType as any }
      component.ngOnInit()
      await flush()
      expect(component.widgetData.errorData).toEqual(expected)
    })
  })
})

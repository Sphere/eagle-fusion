import { of } from 'rxjs'
import { NsContent } from '../_services/widget-content.model'
import { CardContentComponent } from './card-content.component'

describe('CardContentComponent', () => {
  let component: CardContentComponent
  let mockConfigSvc: any
  let mockUtilitySvc: any
  let mockSnackBar: any
  let mockAuthSvc: any
  let mockUserProfileSvc: any
  let mockRouter: any
  let mockTitleService: any

  const baseWidgetData = () => ({
    content: {
      identifier: 'c1',
      contentType: 'Course',
      mimeType: '',
      resourceType: '',
      averageRating: undefined,
      status: 'Live',
      addedOn: '',
      mode: undefined,
      creatorDetails: undefined,
      creatorContacts: undefined,
      isInIntranet: false,
    },
  }) as any

  beforeEach(() => {
    mockConfigSvc = { isIntranetAllowed: false, prefChangeNotifier: of(), rootOrg: 'org1', unMappedUser: undefined }
    mockUtilitySvc = { isMobile: false }
    mockSnackBar = { open: jest.fn() }
    mockAuthSvc = { login: jest.fn() }
    mockUserProfileSvc = {
      getUserdetailsFromRegistry: jest.fn(),
      isBackgroundDetailsFilled: jest.fn(),
    }
    mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn() }
    mockTitleService = { setTitle: jest.fn() }
    component = new CardContentComponent(
      mockConfigSvc,
      mockUtilitySvc,
      mockSnackBar,
      mockAuthSvc,
      mockUserProfileSvc,
      mockRouter,
      mockTitleService,
    )
    component.widgetData = baseWidgetData()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set showLoggedInCard true when url includes public/home', () => {
      Object.defineProperty(window, 'location', { value: { href: 'http://x/public/home' }, writable: true })
      component.ngOnInit()
      expect(component.showLoggedInCard).toBe(true)
    })

    it('should set showLoggedInCard true when url includes explore', () => {
      Object.defineProperty(window, 'location', { value: { href: 'http://x/explore/y' }, writable: true })
      component.ngOnInit()
      expect(component.showLoggedInCard).toBe(true)
    })

    it('should set isUserLoggedIn true when loginbtn in localStorage', () => {
      Object.defineProperty(window, 'location', { value: { href: 'http://x/' }, writable: true })
      localStorage.setItem('loginbtn', '1')
      component.ngOnInit()
      expect(component.isUserLoggedIn).toBe(true)
      localStorage.clear()
    })

    it('should set isUserLoggedIn false when neither key present', () => {
      Object.defineProperty(window, 'location', { value: { href: 'http://x/' }, writable: true })
      localStorage.clear()
      component.ngOnInit()
      expect(component.isUserLoggedIn).toBe(false)
    })

    it('should set isIntranetAllowedSettings from configSvc and update via prefChangeNotifier', () => {
      const { Subject } = require('rxjs')
      const subj = new Subject()
      mockConfigSvc.prefChangeNotifier = subj
      mockConfigSvc.isIntranetAllowed = true
      component.ngOnInit()
      expect(component.isIntranetAllowedSettings).toBe(true)
      mockConfigSvc.isIntranetAllowed = false
      subj.next(undefined)
      expect(component.isIntranetAllowedSettings).toBe(false)
    })

    it('should set defaultThumbnail/sourceLogos/defaultSLogo from instanceConfig', () => {
      mockConfigSvc.instanceConfig = {
        logos: { defaultContent: 'thumb.png', defaultSourceLogo: 'src.png' },
        sources: [{ id: 's1' }],
      }
      component.ngOnInit()
      expect(component.defaultThumbnail).toBe('thumb.png')
      expect(component.sourceLogos).toEqual([{ id: 's1' }])
      expect(component.defaultSLogo).toBe('src.png')
    })

    it('should not set instanceConfig-derived fields when instanceConfig absent', () => {
      mockConfigSvc.instanceConfig = undefined
      component.ngOnInit()
      expect(component.defaultThumbnail).toBe('')
    })

    it('should populate cometencyData from competencies_v1 json with level', () => {
      component.widgetData.content.competencies_v1 = JSON.stringify([
        { competencyName: 'Comm', level: 2 },
        { competencyName: 'NoLevel' },
      ])
      component.ngOnInit()
      expect(component.cometencyData).toEqual([{ name: 'Comm', levels: ' Level 2' }])
    })

    it('should set showFlip true when content.reason present', () => {
      component.widgetData.content.reason = 'because'
      component.ngOnInit()
      expect(component.showFlip).toBe(true)
    })

    it('should compute showIsMode via isLatest(convertToISODate(addedOn)) when content.mode present', () => {
      component.widgetData.content.mode = 'edit'
      component.widgetData.content.addedOn = '20240115123045'
      component.ngOnInit()
      expect(component.showIsMode).toBe(component.isLatest(component.convertToISODate('20240115123045')))
    })

    it('should set showContentTag true when all criteria pass', () => {
      component.widgetData.contentTags = {
        excludeContentType: [],
        excludeMimeType: [],
      }
      component.ngOnInit()
      expect(component.showContentTag).toBe(true)
    })

    it('should set showContentTag false when contentType excluded', () => {
      component.widgetData.contentTags = {
        excludeContentType: ['Course'],
      }
      component.ngOnInit()
      expect(component.showContentTag).toBe(false)
    })
  })

  describe('slugify', () => {
    it('should lowercase, replace ampersands, and hyphenate spaces/symbols', () => {
      expect(component.slugify('Hello & World! Foo_Bar')).toBe('hello-and-world-foo-bar')
    })

    it('should trim leading/trailing hyphens', () => {
      expect(component.slugify('  --Leading and Trailing--  ')).toBe('leading-and-trailing')
    })

    it('should truncate pathologically long titles before processing', () => {
      const longTitle = `${'a'.repeat(500)} end`
      const result = component.slugify(longTitle)
      expect(result.length).toBeLessThanOrEqual(200)
    })

    it('should not hang on a large run of trailing symbols (ReDoS regression guard)', () => {
      const adversarialInput = `title${'-'.repeat(10000)}`
      const start = Date.now()
      component.slugify(adversarialInput)
      expect(Date.now() - start).toBeLessThan(1000)
    })
  })

  describe('showTarget', () => {
    it('should set showEndPopup and targetOffsetX when close to right edge', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true })
      component.target = { targetOffsetX: 0 } as any
      component.showTarget({ clientX: 900 })
      expect(component.showEndPopup).toBe(true)
      expect(component.target.targetOffsetX).toBe(901)
    })

    it('should not set showEndPopup when far from right edge', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true })
      component.showTarget({ clientX: 100 })
      expect(component.showEndPopup).toBe(false)
    })
  })

  describe('clickToRedirect', () => {
    it('should store url and navigate when user not logged in', () => {
      mockConfigSvc.userProfile = null
      component.clickToRedirect({ identifier: 'c1' })
      expect(localStorage.getItem('url_before_login')).toBe('app/toc/c1/overview')
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/toc/c1/overview')
    })

    it('should call raiseTelemetry when user is logged in', () => {
      mockConfigSvc.userProfile = { id: 'u1' }
      mockConfigSvc.unMappedUser = undefined
      component.clickToRedirect({ identifier: 'c1' })
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
    })
  })

  describe('checkContentTypeCriteria', () => {
    it('should return true when no contentTags', () => {
      component.widgetData.contentTags = undefined
      expect(component.checkContentTypeCriteria()).toBe(true)
    })

    it('should return false when contentType excluded', () => {
      component.widgetData.contentTags = { excludeContentType: ['Course'] } as any
      expect(component.checkContentTypeCriteria()).toBe(false)
    })

    it('should return true when contentType not excluded', () => {
      component.widgetData.contentTags = { excludeContentType: ['Other'] } as any
      expect(component.checkContentTypeCriteria()).toBe(true)
    })
  })

  describe('checkMimeTypeCriteria', () => {
    it('should return true when no contentTags', () => {
      component.widgetData.contentTags = undefined
      expect(component.checkMimeTypeCriteria()).toBe(true)
    })

    it('should return false when mimeType excluded', () => {
      component.widgetData.content.mimeType = 'video/mp4'
      component.widgetData.contentTags = { excludeMimeType: ['video/mp4'] } as any
      expect(component.checkMimeTypeCriteria()).toBe(false)
    })
  })

  describe('checkCriteria', () => {
    it('should return true when no contentTags', () => {
      component.widgetData.contentTags = undefined
      expect(component.checkCriteria()).toBe(true)
    })

    it('should evaluate criteria via convertToISODate/getTime comparison against daysSpan window', () => {
      component.widgetData.content.addedOn = '20240115123045'
      component.widgetData.contentTags = { criteriaField: 'addedOn', daysSpan: 7 } as any
      expect(component.checkCriteria()).toBe(false)
    })

    it('should return false when criteria field date is outside span', () => {
      component.widgetData.content.addedOn = '20000101T000000'
      component.widgetData.contentTags = { criteriaField: 'addedOn', daysSpan: 7 } as any
      expect(component.checkCriteria()).toBe(false)
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe prefChangeSubscription when present', () => {
      component.ngOnInit()
      const spy = jest.spyOn(component.prefChangeSubscription as any, 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })

    it('should not throw when prefChangeSubscription absent', () => {
      component.prefChangeSubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('login', () => {
    it('should set title, navigate, and store data', () => {
      component.login({ name: 'Course A', identifier: 'c1' })
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('Course A - Aastrika')
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/public/toc/overview', 'c1', 'course-a'],
        { state: { tocData: { name: 'Course A', identifier: 'c1' } } },
      )
      expect(localStorage.getItem('tocData')).toBeTruthy()
      expect(localStorage.getItem('url_before_login')).toBe('app/toc/c1/overview')
    })
  })

  describe('loginRedirect', () => {
    it('should call authSvc.login with computed url', () => {
      component.loginRedirect('E', 'c1')
      expect(mockAuthSvc.login).toHaveBeenCalledWith('E', `${location.origin}/app/toc/c1/overview`)
    })
  })

  describe('ngAfterViewInit', () => {
    it('should reset offset values', () => {
      component.ngAfterViewInit()
      expect(component.offSetXValue).toBe(290)
      expect(component.offSetYValue).toBe(-340)
    })
  })

  describe('checkDisplayName', () => {
    it('should return name from creatorDetails when valid', () => {
      component.widgetData.content.creatorDetails = [{ name: 'Jane' }] as any
      expect(component.checkDisplayName).toBe('Jane')
    })

    it('should return Not Disclosed when creatorDetails name is null null', () => {
      component.widgetData.content.creatorDetails = [{ name: 'null null' }] as any
      expect(component.checkDisplayName).toBe('Not Disclosed')
    })

    it('should return name from creatorContacts when creatorDetails absent', () => {
      component.widgetData.content.creatorContacts = [{ name: 'Bob' }] as any
      expect(component.checkDisplayName).toBe('Bob')
    })

    it('should return Not Disclosed when creatorContacts name empty', () => {
      component.widgetData.content.creatorContacts = [{ name: '' }] as any
      expect(component.checkDisplayName).toBe('Not Disclosed')
    })

    it('should return empty string when neither present', () => {
      expect(component.checkDisplayName).toBe('')
    })
  })

  describe('imageIcon', () => {
    it('should return Knowledge Artifact icon', () => {
      component.widgetData.content.contentType = NsContent.EContentTypes.KNOWLEDGE_ARTIFACT
      expect(component.imageIcon).toEqual(['class', 'Knowledge Artifact'])
    })

    it('should return folder/Course for non-resource contentType', () => {
      component.widgetData.content.contentType = 'Course'
      expect(component.imageIcon).toEqual(['folder', 'Course'])
    })

    it('should return picture_as_pdf for PDF mimeType', () => {
      component.widgetData.content.contentType = NsContent.EContentTypes.RESOURCE
      component.widgetData.content.mimeType = NsContent.EMimeTypes.PDF
      component.widgetData.content.resourceType = 'Document'
      expect(component.imageIcon).toEqual(['picture_as_pdf', 'Document'])
    })

    it('should return library_music for MP4 mimeType', () => {
      component.widgetData.content.contentType = NsContent.EContentTypes.RESOURCE
      component.widgetData.content.mimeType = NsContent.EMimeTypes.MP4
      expect(component.imageIcon).toEqual(['library_music', component.widgetData.content.resourceType])
    })

    it('should return library_add for HTML mimeType', () => {
      component.widgetData.content.contentType = NsContent.EContentTypes.RESOURCE
      component.widgetData.content.mimeType = NsContent.EMimeTypes.HTML
      expect(component.imageIcon).toEqual(['library_add', component.widgetData.content.resourceType])
    })

    it('should return assignment_ind for QUIZ mimeType', () => {
      component.widgetData.content.contentType = NsContent.EContentTypes.RESOURCE
      component.widgetData.content.mimeType = NsContent.EMimeTypes.QUIZ
      expect(component.imageIcon).toEqual(['assignment_ind', component.widgetData.content.resourceType])
    })

    it('should return description for default mimeType', () => {
      component.widgetData.content.contentType = NsContent.EContentTypes.RESOURCE
      component.widgetData.content.mimeType = 'other/type' as any
      expect(component.imageIcon).toEqual(['description', component.widgetData.content.resourceType])
    })
  })

  describe('isKnowledgeBoard', () => {
    it('should return true when contentType is knowledge board', () => {
      component.widgetData.content.contentType = NsContent.EContentTypes.KNOWLEDGE_BOARD
      expect(component.isKnowledgeBoard).toBe(true)
    })

    it('should return false otherwise', () => {
      component.widgetData.content.contentType = 'Course'
      expect(component.isKnowledgeBoard).toBe(false)
    })
  })

  describe('raiseTelemetry', () => {
    it('should navigate directly when background details filled', () => {
      jest.useFakeTimers()
      mockConfigSvc.unMappedUser = { id: 'u1' }
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of({ profileDetails: { profileReq: {} } }))
      mockUserProfileSvc.isBackgroundDetailsFilled.mockReturnValue(true)
      component.raiseTelemetry()
      jest.advanceTimersByTime(100)
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/toc/c1/overview?primaryCategory=Course')
      jest.useRealTimers()
    })

    it('should navigate to about-you when background details not filled', () => {
      jest.useFakeTimers()
      mockConfigSvc.unMappedUser = { id: 'u1' }
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of({ profileDetails: { profileReq: {} } }))
      mockUserProfileSvc.isBackgroundDetailsFilled.mockReturnValue(false)
      component.raiseTelemetry()
      jest.advanceTimersByTime(100)
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/about-you'], { queryParams: { redirect: '/app/toc/c1/overview' } },
      )
      jest.useRealTimers()
    })

    it('should do nothing when unMappedUser absent', () => {
      mockConfigSvc.unMappedUser = undefined
      component.raiseTelemetry()
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
    })
  })

  describe('isGreyedImage', () => {
    it('should return true for Deleted status', () => {
      component.widgetData.content.status = 'Deleted'
      expect(component.isGreyedImage).toBe(true)
    })

    it('should return true for Expired status', () => {
      component.widgetData.content.status = 'Expired'
      expect(component.isGreyedImage).toBe(true)
    })

    it('should return false otherwise', () => {
      component.widgetData.content.status = 'Live'
      expect(component.isGreyedImage).toBe(false)
    })
  })

  describe('convertToISODate', () => {
    it('should parse a valid date string', () => {
      const result = component.convertToISODate('202401151230')
      expect(result instanceof Date).toBe(true)
    })

    it('should return fallback date on error', () => {
      const result = component.convertToISODate(null as any)
      expect(result instanceof Date).toBe(true)
    })
  })

  describe('isLatest', () => {
    it('should return true for a recent date', () => {
      expect(component.isLatest(new Date())).toBe(true)
    })

    it('should return false for an old date', () => {
      expect(component.isLatest(new Date('2000-01-01'))).toBe(false)
    })

    it('should return false when addedOn falsy', () => {
      expect(component.isLatest(undefined as any)).toBe(false)
    })
  })

  describe('showIntranetContent', () => {
    it('should return true when in intranet, mobile, and not allowed', () => {
      component.widgetData.content.isInIntranet = true
      mockUtilitySvc.isMobile = true
      component.isIntranetAllowedSettings = false
      expect(component.showIntranetContent).toBe(true)
    })

    it('should return false when not in intranet', () => {
      component.widgetData.content.isInIntranet = false
      expect(component.showIntranetContent).toBe(false)
    })
  })

  describe('showSnackbar', () => {
    it('should open snackbar for intranet content restriction', () => {
      component.widgetData.content.isInIntranet = true
      mockUtilitySvc.isMobile = true
      component.isIntranetAllowedSettings = false
      component.showSnackbar()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Content is only available in intranet', undefined, { duration: 2000 })
    })

    it('should open snackbar for expired/deleted content', () => {
      component.widgetData.content.isInIntranet = false
      component.widgetData.content.status = 'Deleted'
      component.showSnackbar()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Content may be expired or deleted', undefined, { duration: 2000 })
    })

    it('should not open snackbar when content is fine', () => {
      component.widgetData.content.isInIntranet = false
      component.widgetData.content.status = 'Live'
      component.showSnackbar()
      expect(mockSnackBar.open).not.toHaveBeenCalled()
    })
  })

  describe('isLiveOrMarkForDeletion', () => {
    it('should return true when status is Live', () => {
      component.widgetData.content.status = 'Live'
      expect(component.isLiveOrMarkForDeletion).toBe(true)
    })

    it('should return true when status is MarkedForDeletion', () => {
      component.widgetData.content.status = 'MarkedForDeletion'
      expect(component.isLiveOrMarkForDeletion).toBe(true)
    })

    it('should return true when status is falsy', () => {
      component.widgetData.content.status = undefined
      expect(component.isLiveOrMarkForDeletion).toBe(true)
    })

    it('should return false for other statuses', () => {
      component.widgetData.content.status = 'Deleted'
      expect(component.isLiveOrMarkForDeletion).toBe(false)
    })
  })

  describe('modifySensibleContentRating (via ngOnInit)', () => {
    it('should resolve per-org averageRating object into a number', () => {
      component.widgetData.content.averageRating = { org1: 4.5 } as any
      component.ngOnInit()
      expect(component.widgetData.content.averageRating).toBe(4.5)
    })

    it('should default averageRating to 0 when falsy', () => {
      component.widgetData.content.averageRating = undefined
      component.ngOnInit()
      expect(component.widgetData.content.averageRating).toBe(0)
    })
  })
})

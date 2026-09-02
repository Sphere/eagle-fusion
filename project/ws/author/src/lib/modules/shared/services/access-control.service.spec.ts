import { AccessControlService } from './access-control.service'
import { ICON_TYPE } from '@ws/author/src/lib/constants/icons'
import { MIME_TYPE } from '@ws/author/src/lib/constants/mimeType'
import { AUTHORING_CONTENT_BASE } from '@ws/author/src/lib/constants/apiEndpoints'

describe('AccessControlService', () => {
  let service: AccessControlService
  let configService: any

  const build = (baseHref = '/en/') => new AccessControlService(configService, baseHref)

  beforeEach(() => {
    configService = {
      userRoles: new Set<string>(),
      userProfile: null,
      instanceConfig: null,
      activeOrg: null,
      rootOrg: null,
      activeThemeObject: null,
    }
    service = build()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('hasRole', () => {
    it('should match a role case-insensitively', () => {
      configService.userRoles = new Set(['editor'])
      expect(service.hasRole(['Editor'])).toBe(true)
    })

    it('should match when any of the requested roles is held', () => {
      configService.userRoles = new Set(['publisher'])
      expect(service.hasRole(['editor', 'publisher'])).toBe(true)
    })

    it('should not match an unheld role', () => {
      configService.userRoles = new Set(['viewer'])
      expect(service.hasRole(['editor'])).toBe(false)
    })

    it('should treat missing roles as an empty set', () => {
      configService.userRoles = null
      expect(service.hasRole(['editor'])).toBe(false)
    })

    it('should return false for an empty request', () => {
      expect(service.hasRole([])).toBe(false)
    })
  })

  describe('profile getters', () => {
    it('should return the user id from the profile', () => {
      configService.userProfile = { userId: 'u1', userName: 'Ada' }
      expect(service.userId).toBe('u1')
      expect(service.userName).toBe('Ada')
    })

    it('should return empty strings when there is no profile', () => {
      expect(service.userId).toBe('')
      expect(service.userName).toBe('')
    })

    it('should return an empty user name when the profile has none', () => {
      configService.userProfile = { userId: 'u1' }
      expect(service.userName).toBe('')
    })
  })

  describe('locale', () => {
    it('should take the language segment from the base href', () => {
      expect(build('/hi-IN/').locale).toBe('hi')
    })

    it('should fall back to en for a root base href', () => {
      expect(build('/').locale).toBe('en')
    })

    it('should fall back to en for an empty base href', () => {
      expect(build('').locale).toBe('en')
    })
  })

  describe('org getters', () => {
    it('should return the configured org and root org', () => {
      configService.activeOrg = 'Aastrika'
      configService.rootOrg = 'aastrika'
      expect(service.org).toBe('Aastrika')
      expect(service.rootOrg).toBe('aastrika')
      expect(service.orgRootOrgAsQuery).toBe('?rootOrg=aastrika&org=Aastrika')
    })

    it('should fall back to the defaults when nothing is configured', () => {
      expect(service.org).toBe('DOPT Ltd')
      expect(service.rootOrg).toBe('dopt')
      expect(service.orgRootOrgAsQuery).toBe('?rootOrg=dopt&org=DOPT Ltd')
    })
  })

  describe('instance config getters', () => {
    it('should read the authoring, logo and app name from the instance config', () => {
      configService.instanceConfig = {
        authoring: { enabled: true },
        logos: { defaultContent: 'logo.png' },
        details: { appName: 'Sphere' },
      }
      expect(service.authoringConfig).toEqual({ enabled: true })
      expect(service.defaultLogo).toBe('logo.png')
      expect(service.appName).toBe('Sphere')
    })

    it('should fall back when there is no instance config', () => {
      expect(service.defaultLogo).toBe('')
      expect(service.appName).toBe('Wingspan')
    })

    it('should read the active primary colour from the theme', () => {
      configService.activeThemeObject = { color: { primary: '#17283C' } }
      expect(service.activePrimary).toBe('#17283C')
    })

    it('should return an empty primary colour when no theme is active', () => {
      expect(service.activePrimary).toBe('')
    })
  })

  describe('getAction', () => {
    it('should map draft and live to submitted', () => {
      expect(service.getAction('Draft')).toBe('submitted')
      expect(service.getAction('Live')).toBe('submitted')
    })

    it('should map in-review by the operation flag', () => {
      expect(service.getAction('InReview', 1)).toBe('reviewerApproved')
      expect(service.getAction('InReview', 0)).toBe('reviewerRejected')
    })

    it('should map quality-review by the operation flag', () => {
      expect(service.getAction('QualityReview', 1)).toBe('qualityApproved')
      expect(service.getAction('QualityReview')).toBe('qualityRejected')
    })

    it('should map reviewed by the operation flag', () => {
      expect(service.getAction('Reviewed', 1)).toBe('publisherApproved')
      expect(service.getAction('Reviewed')).toBe('publisherRejected')
    })

    it('should map an unknown status to submitted', () => {
      expect(service.getAction('Unknown')).toBe('submitted')
    })
  })

  describe('hasAccess', () => {
    const meta = (overrides: any = {}) => ({ status: 'Draft', ...overrides }) as any

    it('should grant access to editors and admins outright', () => {
      configService.userRoles = new Set(['admin'])
      expect(service.hasAccess(meta({ status: 'Reviewed' }))).toBe(true)
    })

    it('should grant a creator access to their own draft', () => {
      configService.userProfile = { userId: 'u1' }
      expect(service.hasAccess(meta({ creatorContacts: [{ id: 'u1' }] }))).toBe(true)
    })

    it('should deny a non-creator access to a draft', () => {
      configService.userProfile = { userId: 'u2' }
      expect(service.hasAccess(meta({ creatorContacts: [{ id: 'u1' }] }))).toBe(false)
    })

    it('should deny when the draft has no creator contacts', () => {
      configService.userProfile = { userId: 'u1' }
      expect(service.hasAccess(meta({ creatorContacts: [] }))).toBe(false)
      expect(service.hasAccess(meta())).toBe(false)
    })

    it('should grant a listed reviewer access to in-review content', () => {
      configService.userRoles = new Set(['reviewer'])
      configService.userProfile = { userId: 'u1' }
      expect(service.hasAccess(meta({ status: 'InReview', trackContacts: [{ id: 'u1' }] }))).toBe(true)
    })

    it('should deny a reviewer who is not on the track contacts', () => {
      configService.userRoles = new Set(['reviewer'])
      configService.userProfile = { userId: 'u2' }
      expect(service.hasAccess(meta({ status: 'InReview', trackContacts: [{ id: 'u1' }] }))).toBe(false)
    })

    it('should deny in-review content to someone without the reviewer role', () => {
      configService.userProfile = { userId: 'u1' }
      expect(service.hasAccess(meta({ status: 'InReview', trackContacts: [{ id: 'u1' }] }))).toBe(false)
    })

    it('should grant a listed publisher access to reviewed content', () => {
      configService.userRoles = new Set(['publisher'])
      configService.userProfile = { userId: 'u1' }
      expect(service.hasAccess(meta({ status: 'Reviewed', publisherDetails: [{ id: 'u1' }] }))).toBe(true)
    })

    it('should grant a reviewer access via an overlapping parent creator', () => {
      configService.userRoles = new Set(['reviewer'])
      configService.userProfile = { userId: 'u2' }
      const child = meta({ status: 'InReview', trackContacts: [], creatorContacts: [{ id: 'shared' }] })
      const parent = meta({ creatorContacts: [{ id: 'shared' }] })
      expect(service.hasAccess(child, false, parent)).toBe(true)
    })

    it('should deny when the parent creators do not overlap', () => {
      configService.userRoles = new Set(['reviewer'])
      const child = meta({ status: 'InReview', creatorContacts: [{ id: 'a' }] })
      const parent = meta({ creatorContacts: [{ id: 'b' }] })
      expect(service.hasAccess(child, false, parent)).toBe(false)
    })

    it('should deny when there is no parent to fall back to', () => {
      configService.userRoles = new Set(['reviewer'])
      expect(service.hasAccess(meta({ status: 'InReview', creatorContacts: [{ id: 'a' }] }))).toBe(false)
    })

    it('should grant preview access to public content', () => {
      expect(service.hasAccess(meta({ status: 'Reviewed', visibility: 'Public' }), true)).toBe(true)
    })

    it('should not grant preview access to non-public content', () => {
      expect(service.hasAccess(meta({ status: 'Reviewed', visibility: 'Private' }), true)).toBe(false)
    })
  })

  describe('date conversion', () => {
    it('should parse a compact timestamp into a Date', () => {
      const date = service.convertToISODate('20260804T101530')
      expect(date.toISOString()).toBe('2026-08-04T10:15:30.000Z')
    })

    it('should return a Date without throwing for a malformed value', () => {
      let result: Date | undefined
      expect(() => { result = service.convertToISODate('nonsense') }).not.toThrow()
      expect(result).toBeInstanceOf(Date)
    })

    it('should return a Date without throwing when no value is given', () => {
      let result: Date | undefined
      expect(() => { result = service.convertToISODate() }).not.toThrow()
      expect(result).toBeInstanceOf(Date)
    })

    it('should format a Date back into the compact ES form', () => {
      expect(service.convertToESDate(new Date('2026-08-04T10:15:30.000Z'))).toBe('20260804T101530+0000')
    })
  })

  describe('getCategory / getCategoryType', () => {
    it('should prefer the explicit category', () => {
      expect(service.getCategory({ category: 'Course', contentType: 'Resource' } as any)).toBe('Course')
    })

    it('should fall back to the content type for legacy content', () => {
      expect(service.getCategory({ contentType: 'Resource' } as any)).toBe('Resource')
    })

    it('should prefer an explicit category type', () => {
      expect(service.getCategoryType({ category: 'Resource', categoryType: 'Video' } as any)).toBe('Video')
    })

    it('should fall back to the resource type for a Resource', () => {
      expect(service.getCategoryType({ category: 'Resource', resourceType: 'Video' } as any)).toBe('Video')
    })

    it('should default a Resource with no type to "Resource"', () => {
      expect(service.getCategoryType({ category: 'Resource' } as any)).toBe('Resource')
    })

    it('should default a Collection to Module', () => {
      expect(service.getCategoryType({ category: 'Collection' } as any)).toBe('Module')
    })

    it('should default a Course to Course', () => {
      expect(service.getCategoryType({ category: 'Course' } as any)).toBe('Course')
    })

    it('should default a Learning Path to Program', () => {
      expect(service.getCategoryType({ category: 'Learning Path' } as any)).toBe('Program')
    })

    it('should echo the category for anything else', () => {
      expect(service.getCategoryType({ category: 'Knowledge Board' } as any)).toBe('Knowledge Board')
    })
  })

  describe('getIcon', () => {
    const content = (overrides: any = {}) => overrides as any

    it('should pick a knowledge-board icon for a KB collection', () => {
      expect(service.getIcon(content({ mimeType: MIME_TYPE.collection, category: 'Knowledge Board' })))
        .toBe(ICON_TYPE.kBoard)
    })

    it('should pick a program icon for a learning path collection', () => {
      expect(service.getIcon(content({ mimeType: MIME_TYPE.collection, category: 'Learning Path' })))
        .toBe(ICON_TYPE.program)
    })

    it('should pick a course icon for a course collection', () => {
      expect(service.getIcon(content({ mimeType: MIME_TYPE.collection, category: 'Course' })))
        .toBe(ICON_TYPE.course)
    })

    it('should pick a learning-module icon for any other collection', () => {
      expect(service.getIcon(content({ mimeType: MIME_TYPE.collection, category: 'Collection' })))
        .toBe(ICON_TYPE.learningModule)
    })

    it('should pick a certificate icon for certification html', () => {
      expect(service.getIcon(content({ mimeType: MIME_TYPE.html, resourceType: 'Certification' })))
        .toBe(ICON_TYPE.certificate)
    })

    it('should pick an external-content icon for external html', () => {
      expect(service.getIcon(content({ mimeType: MIME_TYPE.html, isExternal: true })))
        .toBe(ICON_TYPE.externalContent)
    })

    it('should pick an internal-content icon for plain html', () => {
      expect(service.getIcon(content({ mimeType: MIME_TYPE.html }))).toBe(ICON_TYPE.internalContent)
    })

    it('should distinguish an uploaded pdf from an empty one', () => {
      expect(service.getIcon(content({ mimeType: MIME_TYPE.pdf, artifactUrl: 'f.pdf' }))).toBe(ICON_TYPE.pdf)
      expect(service.getIcon(content({ mimeType: MIME_TYPE.pdf }))).toBe(ICON_TYPE.emptyFile)
    })

    it('should distinguish an assessment from a quiz', () => {
      expect(service.getIcon(content({ mimeType: MIME_TYPE.quiz, categoryType: 'Assessment', category: 'Resource' })))
        .toBe(ICON_TYPE.assessment)
      expect(service.getIcon(content({ mimeType: MIME_TYPE.quiz, category: 'Resource' })))
        .toBe(ICON_TYPE.quiz)
    })

    const simple: [string, string][] = [
      [MIME_TYPE.youtube, ICON_TYPE.youtube],
      [MIME_TYPE.dragDrop, ICON_TYPE.dragNDrop],
      [MIME_TYPE.htmlPicker, ICON_TYPE.htmlPicker],
      [MIME_TYPE.webModule, ICON_TYPE.internalContent],
      [MIME_TYPE.handson, ICON_TYPE.handsOn],
      [MIME_TYPE.iap, ICON_TYPE.iap],
      [MIME_TYPE.mp3, ICON_TYPE.audio],
      [MIME_TYPE.mp4, ICON_TYPE.video],
    ]

    simple.forEach(([mimeType, icon]) => {
      it(`should map ${mimeType} to ${icon}`, () => {
        expect(service.getIcon(content({ mimeType }))).toBe(icon)
      })
    })

    it('should fall back to the default icon for an unknown mime type', () => {
      expect(service.getIcon(content({ mimeType: 'application/unknown' }))).toBe(ICON_TYPE.default)
    })
  })

  describe('proxyToAuthoringUrl', () => {
    it('should rewrite a content-store url through the authoring proxy', () => {
      const input = `src="https://cdn.example.com/content-store/asset.png"`
      const result = service.proxyToAuthoringUrl(input)
      expect(result).toContain(AUTHORING_CONTENT_BASE)
      expect(result).toContain(encodeURIComponent('https://cdn.example.com/content-store/asset.png'))
    })

    it('should leave unrelated urls untouched', () => {
      const input = `src="https://cdn.example.com/other/asset.png"`
      expect(service.proxyToAuthoringUrl(input)).toBe(input)
    })

    it('should build the replacement from the captured groups', () => {
      expect(service.regexDownloadReplace('', 'https://x/content-store/a.png', '"'))
        .toBe(`${AUTHORING_CONTENT_BASE}${encodeURIComponent('https://x/content-store/a.png')}"`)
    })
  })
})

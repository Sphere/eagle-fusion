import { of } from 'rxjs'

jest.mock('html-to-image', () => ({
  toPng: jest.fn(),
}))

import * as htmlToImage from 'html-to-image'
import { NsContent } from '../../_services/widget-content.model'
import { BtnContentShareDialogComponent } from './btn-content-share-dialog.component'

function createComponent(overrides: any = {}): BtnContentShareDialogComponent {
  const eventsMock = { raiseInteractTelemetry: jest.fn() }
  const snackBarMock = {}
  const dialogRefMock = {}
  const data = {
    content: {
      identifier: 'content-1',
      contentType: 'Course',
      artifactUrl: '/artifact',
    },
  }
  const shareSvcMock = {
    fetchConfigFile: jest.fn().mockReturnValue(of({ shareMessage: 'Custom share message' })),
  }
  const configSvcMock = {
    restrictedFeatures: null,
    activeLocale: null,
  }
  const cdrMock = { detectChanges: jest.fn() }

  return new BtnContentShareDialogComponent(
    overrides.events || eventsMock as any,
    overrides.snackBar || snackBarMock as any,
    overrides.dialogRef || dialogRefMock as any,
    overrides.data || data as any,
    overrides.shareSvc || shareSvcMock as any,
    overrides.configSvc || configSvcMock as any,
    overrides.cdr || cdrMock as any,
  )
}

describe('BtnContentShareDialogComponent', () => {
  let component: BtnContentShareDialogComponent

  beforeEach(() => {
    jest.clearAllMocks()
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set qrdata and message from fetchConfigFile response', () => {
      component.ngOnInit()
      expect(component.qrdata).toContain('public/toc/overview?courseId=')
      expect(component.message).toBe('Custom share message')
    })

    it('should default message when fetchConfigFile has no shareMessage', () => {
      const shareSvcMock = { fetchConfigFile: jest.fn().mockReturnValue(of({})) }
      component = createComponent({ shareSvc: shareSvcMock })
      component.ngOnInit()
      expect(component.message).toBe('I want to share this artifact I found.')
    })

    it('should default message when fetchConfigFile emits null', () => {
      const shareSvcMock = { fetchConfigFile: jest.fn().mockReturnValue(of(null)) }
      component = createComponent({ shareSvc: shareSvcMock })
      component.ngOnInit()
      expect(component.message).toBe('I want to share this artifact I found.')
    })

    it('should not set isSocialMediaShareEnabled when restrictedFeatures is falsy', () => {
      component.ngOnInit()
      expect(component.isSocialMediaShareEnabled).toBe(false)
    })

    it('should enable social media share when a feature is not restricted', () => {
      const configSvcMock = {
        restrictedFeatures: new Set(['socialMediaFacebookShare']),
        activeLocale: null,
      }
      component = createComponent({ configSvc: configSvcMock })
      component.ngOnInit()
      expect(component.isSocialMediaShareEnabled).toBe(true)
    })

    it('should disable social media share when all features are restricted', () => {
      const configSvcMock = {
        restrictedFeatures: new Set([
          'socialMediaFacebookShare',
          'socialMediaLinkedinShare',
          'socialMediaTwitterShare',
          'socialMediaWhatsappShare',
        ]),
        activeLocale: null,
      }
      component = createComponent({ configSvc: configSvcMock })
      component.ngOnInit()
      expect(component.isSocialMediaShareEnabled).toBe(false)
    })
  })

  describe('saveAsImage', () => {
    it('should generate a png and trigger a download', async () => {
      const clickSpy = jest.fn()
      const createElSpy = jest.spyOn(document, 'createElement').mockReturnValue({
        set download(_v: string) { },
        set href(_v: string) { },
        click: clickSpy,
      } as any)
        ; (htmlToImage.toPng as jest.Mock).mockResolvedValue('data:image/png;base64,abc')

      component.saveAsImage({ qrcElement: { nativeElement: {} } })
      await Promise.resolve()
      await Promise.resolve()

      expect(clickSpy).toHaveBeenCalled()
      createElSpy.mockRestore()
    })
  })

  describe('detailUrl', () => {
    it('should build url for CHANNEL contentType', () => {
      component.data = { content: { contentType: NsContent.EContentTypes.CHANNEL, artifactUrl: '/x', identifier: 'id1' } } as any
      expect(component.detailUrl).toContain('/x')
    })

    it('should build url for KNOWLEDGE_BOARD contentType', () => {
      component.data = { content: { contentType: NsContent.EContentTypes.KNOWLEDGE_BOARD, identifier: 'id1' } } as any
      expect(component.detailUrl).toContain('/app/knowledge-board/id1')
    })

    it('should build url for KNOWLEDGE_ARTIFACT contentType', () => {
      component.data = { content: { contentType: NsContent.EContentTypes.KNOWLEDGE_ARTIFACT, identifier: 'id1' } } as any
      expect(component.detailUrl).toContain('/app/toc/id1/overview')
    })

    it('should build default url for unknown contentType', () => {
      component.data = { content: { contentType: 'Unknown', identifier: 'id1' } } as any
      expect(component.detailUrl).toContain('/app/toc/id1/overview')
    })

    it('should append activeLocale path when present', () => {
      component.configSvc = { activeLocale: { path: 'en' } } as any
      component.data = { content: { contentType: 'Unknown', identifier: 'id1' } } as any
      expect(component.detailUrl).toContain('/en/app/toc/id1/overview')
    })
  })

  describe('raiseTelemetry', () => {
    it('should raise interact telemetry with content details', () => {
      component.data = { content: { identifier: 'id1', contentType: 'Course' } } as any
      component.raiseTelemetry()
      expect(component.events.raiseInteractTelemetry).toHaveBeenCalledWith(
        'btn-clicked',
        'share',
        'content',
        expect.objectContaining({ id: 'id1', type: 'Course' }),
        expect.objectContaining({ values: [{ contentId: 'id1', contentType: 'Course' }] }),
      )
    })
  })
})

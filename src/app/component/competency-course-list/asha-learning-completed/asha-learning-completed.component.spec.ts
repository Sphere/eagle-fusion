jest.mock('../../../../../library/ws-widget/collection/src/public-api', () => ({
  WidgetContentService: class {},
}))

import { of, throwError } from 'rxjs'
import { AshaLearningCompletedComponent } from './asha-learning-completed.component'

describe('AshaLearningCompletedComponent', () => {
  let comp: AshaLearningCompletedComponent
  let mockRouter: any
  let mockContentSvc: any
  let mockConfigSvc: any
  let mockTranslate: any
  let mockLogger: any
  let mockCdr: any

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() }
    mockContentSvc = {
      fetchCompetencyCertificateStatus: jest.fn(),
      fetchCompetencyCertificate: jest.fn(),
    }
    mockConfigSvc = { userProfile: { userId: 'u1' } }
    mockTranslate = { instant: jest.fn((key: string) => key) }
    mockLogger = { error: jest.fn() }
    mockCdr = { detectChanges: jest.fn() }
    comp = new AshaLearningCompletedComponent(mockRouter, mockContentSvc, mockConfigSvc, mockTranslate, mockLogger, mockCdr)
    comp.ashaData = { competencyID: '7', title: 'Vaginal examination' }
  })

  it('should create with defaults', () => {
    expect(comp).toBeTruthy()
    expect(comp.completedCount).toBe(0)
    expect(() => comp.ngOnInit()).not.toThrow()
  })

  it('viewCourses navigates to search with the five level queries', () => {
    comp.viewCourses({ competencyID: '7' })
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search'], {
      queryParams: {
        q: ['7-1', '7-2', '7-3', '7-4', '7-5'],
        competency: true,
        redirect: 'page/home',
      },
      queryParamsHandling: 'merge',
    })
  })

  it('viewCourses does nothing without a competencyID', () => {
    comp.viewCourses({})
    expect(mockRouter.navigate).not.toHaveBeenCalled()
  })

  describe('downloadCertificate', () => {
    it('downloads the certificate when the status is GENERATED', () => {
      mockContentSvc.fetchCompetencyCertificateStatus.mockReturnValue(of([{ competencyId: '7', status: 'GENERATED' }]))
      mockContentSvc.fetchCompetencyCertificate.mockReturnValue(of({ competencyId: '7', certificateUrl: 'https://x/cert.jpg' }))
      const saveSpy = jest.spyOn(comp, 'saveCertificate').mockImplementation(() => undefined)
      const event = { stopPropagation: jest.fn() } as any

      comp.downloadCertificate(event)

      expect(event.stopPropagation).toHaveBeenCalled()
      expect(mockContentSvc.fetchCompetencyCertificateStatus).toHaveBeenCalledWith('u1', '7')
      expect(mockContentSvc.fetchCompetencyCertificate).toHaveBeenCalledWith('u1', '7')
      expect(saveSpy).toHaveBeenCalledWith('https://x/cert.jpg')
      expect(comp.certificateMessage).toBe('')
      expect(comp.isCertificateLoading).toBe(false)
    })

    it('shows the API message and skips download when the status is not GENERATED', () => {
      mockContentSvc.fetchCompetencyCertificateStatus.mockReturnValue(
        of([{ competencyId: '7', status: 'FAILED', message: 'Course deleted' }]))

      comp.downloadCertificate()

      expect(mockContentSvc.fetchCompetencyCertificate).not.toHaveBeenCalled()
      expect(comp.certificateMessage).toBe('Course deleted')
    })

    it('falls back to a translated message when the status has no message', () => {
      mockContentSvc.fetchCompetencyCertificateStatus.mockReturnValue(of([{ competencyId: '7', status: 'PENDING' }]))

      comp.downloadCertificate()

      expect(comp.certificateMessage).toBe('Your certificate is not ready yet')
    })

    it('shows an error message when the competency has no status entry', () => {
      mockContentSvc.fetchCompetencyCertificateStatus.mockReturnValue(of([]))

      comp.downloadCertificate()

      expect(comp.certificateMessage).toBe('We could not load your certificate')
    })

    it('shows an error message when the download returns no URL', () => {
      mockContentSvc.fetchCompetencyCertificateStatus.mockReturnValue(of([{ competencyId: '7', status: 'GENERATED' }]))
      mockContentSvc.fetchCompetencyCertificate.mockReturnValue(of(null))

      comp.downloadCertificate()

      expect(comp.certificateMessage).toBe('We could not load your certificate')
    })

    it('logs and shows an error message when the API fails', () => {
      mockContentSvc.fetchCompetencyCertificateStatus.mockReturnValue(throwError(() => new Error('500')))

      comp.downloadCertificate()

      expect(mockLogger.error).toHaveBeenCalled()
      expect(comp.certificateMessage).toBe('We could not load your certificate')
      expect(comp.isCertificateLoading).toBe(false)
    })

    it('does nothing without a userId or competencyID', () => {
      mockConfigSvc.userProfile = undefined
      comp.downloadCertificate()
      mockConfigSvc.userProfile = { userId: 'u1' }
      comp.ashaData = {}
      comp.downloadCertificate()

      expect(mockContentSvc.fetchCompetencyCertificateStatus).not.toHaveBeenCalled()
    })

    it('ignores clicks while a request is in flight', () => {
      comp.isCertificateLoading = true
      comp.downloadCertificate()
      expect(mockContentSvc.fetchCompetencyCertificateStatus).not.toHaveBeenCalled()
    })
  })

  describe('saveCertificate', () => {
    it('shows an error message when the file fetch fails', async () => {
      (globalThis as any).fetch = jest.fn().mockResolvedValue({ ok: false })

      comp.saveCertificate('https://x/cert.jpg')
      await new Promise(resolve => setTimeout(resolve))

      expect(mockLogger.error).toHaveBeenCalled()
      expect(comp.certificateMessage).toBe('We could not load your certificate')
    })

    it('saves the fetched blob through an anchor', async () => {
      (globalThis as any).fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) })
      // setup-jest.ts stubs createObjectURL as a non-writable jest.fn; configure it rather than replace it
      ;(URL.createObjectURL as jest.Mock).mockReturnValue('blob:x')
      if (typeof URL.revokeObjectURL === 'undefined') {
        Object.defineProperty(URL, 'revokeObjectURL', { value: jest.fn(), configurable: true })
      }
      const revokeSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
      const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

      comp.saveCertificate('https://x/cert.jpg')
      await new Promise(resolve => setTimeout(resolve))

      expect(clickSpy).toHaveBeenCalled()
      expect(revokeSpy).toHaveBeenCalledWith('blob:x')
      clickSpy.mockRestore()
    })
  })
})

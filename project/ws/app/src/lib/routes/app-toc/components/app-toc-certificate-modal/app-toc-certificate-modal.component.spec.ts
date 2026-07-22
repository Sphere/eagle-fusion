import { MatDialogRef } from '@angular/material/dialog'
import { ChangeDetectorRef } from '@angular/core'
import { of } from 'rxjs'

jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class MockWidgetContentService {},
}))

import { WidgetContentService } from '@ws-widget/collection'
import { LoggerService, SafeResourceUrlService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'
import { AppTocCertificateModalComponent } from './app-toc-certificate-modal.component'

const mockDialogRef: Partial<MatDialogRef<AppTocCertificateModalComponent>> = {
  close: jest.fn(),
}

const mockContentSvc: Partial<WidgetContentService> = {
  downloadCertificateAPI: jest.fn().mockReturnValue(of({ responseCode: 'OK', result: { printUri: 'http://example.com/cert.png' } })),
}

const mockSanitizer: Partial<SafeResourceUrlService> = {
  trustUrl: jest.fn().mockReturnValue('trusted-url'),
}

const mockLogger: Partial<LoggerService> = {
  log: jest.fn(),
}

const mockCdr: Partial<ChangeDetectorRef> = {
  detectChanges: jest.fn(),
}

const mockContent = { content: { identifier: 'id-1' }, tocConfig: 'cert-name', identifier: 'id-1' }

function createComponent(): AppTocCertificateModalComponent {
  return new AppTocCertificateModalComponent(
    mockDialogRef as MatDialogRef<AppTocCertificateModalComponent>,
    mockContent,
    mockContentSvc as WidgetContentService,
    mockSanitizer as SafeResourceUrlService,
    mockLogger as LoggerService,
    mockCdr as ChangeDetectorRef,
  )
}

describe('AppTocCertificateModalComponent', () => {
  let component: AppTocCertificateModalComponent

  beforeEach(() => {
    jest.clearAllMocks()
    ;(mockContentSvc.downloadCertificateAPI as jest.Mock).mockReturnValue(
      of({ responseCode: 'OK', result: { printUri: 'http://example.com/cert.png' } }),
    )
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set img and isLoading false when download succeeds on init', async () => {
    component.ngOnInit()
    await Promise.resolve()
    await Promise.resolve()
    expect(mockLogger.log).toHaveBeenCalledWith(mockContent)
    expect(mockSanitizer.trustUrl).toHaveBeenCalledWith('http://example.com/cert.png')
    expect(component.img).toBe('trusted-url')
    expect(component.isLoading).toBe(false)
    expect(mockCdr.detectChanges).toHaveBeenCalled()
  })

  it('should not update state when responseCode is missing on init', async () => {
    ;(mockContentSvc.downloadCertificateAPI as jest.Mock).mockReturnValue(of({ responseCode: undefined }))
    component = createComponent()
    component.ngOnInit()
    await Promise.resolve()
    expect(component.isLoading).toBe(true)
    expect(mockCdr.detectChanges).not.toHaveBeenCalled()
  })

  it('should call downloadCertificateAPI when downloadCertificate is invoked', async () => {
    component.downloadCertificate(mockContent)
    await Promise.resolve()
    expect(mockContentSvc.downloadCertificateAPI).toHaveBeenCalledWith(mockContent.content)
  })

  it('should not throw when responseCode is missing in downloadCertificate', async () => {
    ;(mockContentSvc.downloadCertificateAPI as jest.Mock).mockReturnValue(of({ responseCode: undefined }))
    expect(() => component.downloadCertificate(mockContent)).not.toThrow()
  })
})

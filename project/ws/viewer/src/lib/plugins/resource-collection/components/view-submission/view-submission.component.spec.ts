import { of } from 'rxjs'
import { ViewSubmissionComponent } from './view-submission.component'

describe('ViewSubmissionComponent', () => {
  let component: ViewSubmissionComponent
  const mockDialogRef = { close: jest.fn() } as any
  const mockResourceSvc = {
    readContentTextFile: jest.fn().mockReturnValue(of('answer one\nanswer two\n\n')),
  } as any
  const mockSnackBar = { open: jest.fn() } as any

  const createComponent = (data: { url: string, type: string }) =>
    new ViewSubmissionComponent(mockDialogRef, mockResourceSvc, mockSnackBar, data)

  beforeEach(() => {
    jest.clearAllMocks()
    mockResourceSvc.readContentTextFile.mockReturnValue(of('answer one\nanswer two\n\n'))
  })

  it('should create and set submissionUrl/submissionType from data', () => {
    component = createComponent({ url: 'http://some.url/file.txt', type: 'input' })
    expect(component).toBeTruthy()
    expect(component.submissionUrl).toBe('http://some.url/file.txt')
    expect(component.submissionType).toBe('txt')
  })

  it('should not set submissionType when data.type is falsy', () => {
    component = createComponent({ url: '', type: '' })
    expect(component.submissionUrl).toBe('')
    expect(component.submissionType).toBe('')
  })

  describe('ngOnInit', () => {
    it('should read text file and filter empty lines for txt type', () => {
      component = createComponent({ url: 'http://some.url/file.txt', type: 'input' })
      component.ngOnInit()
      expect(mockResourceSvc.readContentTextFile).toHaveBeenCalledWith('http://some.url/file.txt')
      expect(component.submissionAnswerText).toEqual(['answer one', 'answer two'])
    })

    it('should set videoData for mp4 type', () => {
      component = createComponent({ url: 'http://some.url/file.mp4', type: 'video/mp4' })
      component.ngOnInit()
      expect(component.videoData).toEqual({ url: 'http://some.url/file.mp4', disableTelemetry: true })
    })

    it('should set pdfData for pdf type', () => {
      component = createComponent({ url: 'http://some.url/file.pdf', type: 'application/pdf' })
      component.ngOnInit()
      expect(component.pdfData).toEqual({ pdfUrl: 'http://some.url/file.pdf', hideControls: true })
    })

    it('should show invalid type snackbar and close when submissionUrl set but type unsupported', () => {
      component = createComponent({ url: 'http://some.url/file.txt', type: 'unsupported' })
      const closeSpy = jest.spyOn(component, 'close')
      component.ngOnInit()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid Type', undefined, { duration: 1000 })
      expect(closeSpy).toHaveBeenCalled()
    })

    it('should show invalid content snackbar and close when no submissionUrl', () => {
      component = createComponent({ url: '', type: '' })
      const closeSpy = jest.spyOn(component, 'close')
      component.ngOnInit()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid Content', undefined, { duration: 1000 })
      expect(closeSpy).toHaveBeenCalled()
    })
  })

  describe('close', () => {
    it('should reset data and close the dialog', () => {
      component = createComponent({ url: 'http://some.url/file.mp4', type: 'video/mp4' })
      component.ngOnInit()
      component.close()
      expect(component.pdfData).toBeNull()
      expect(component.videoData).toBeNull()
      expect(mockDialogRef.close).toHaveBeenCalled()
    })
  })
})

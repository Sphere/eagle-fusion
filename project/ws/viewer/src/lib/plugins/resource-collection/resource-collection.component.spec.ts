jest.mock('./components/view-submission/view-submission.component', () => ({
  ViewSubmissionComponent: class {},
}))

import { of, throwError } from 'rxjs'
import { ResourceCollectionComponent } from './resource-collection.component'

describe('ResourceCollectionComponent', () => {
  let component: ResourceCollectionComponent
  const mockSnackBar = { open: jest.fn() } as any
  const mockDialog = { open: jest.fn() } as any
  const mockResourceSvc = {
    getAllSubmission: jest.fn().mockReturnValue(of({ response: [] })),
    createContentDirectory: jest.fn().mockReturnValue(of({})),
    uploadFile: jest.fn().mockReturnValue(of({})),
    postSubmission: jest.fn().mockReturnValue(of({})),
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))
    mockResourceSvc.createContentDirectory.mockReturnValue(of({}))
    mockResourceSvc.uploadFile.mockReturnValue(of({}))
    mockResourceSvc.postSubmission.mockReturnValue(of({}))
    component = new ResourceCollectionComponent(mockSnackBar, mockResourceSvc, mockDialog)
    component.resourceCollectionData = { identifier: 'content-1' } as any
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('changeFile', () => {
    it('should set selectedFile to the first file', () => {
      const file = new File(['abc'], 'a.pdf', { type: 'application/pdf' })
      component.changeFile([file])
      expect(component.selectedFile).toBe(file)
    })

    it('should reset a previously selected file before setting new one', () => {
      const file1 = new File(['abc'], 'a.pdf', { type: 'application/pdf' })
      const file2 = new File(['def'], 'b.pdf', { type: 'application/pdf' })
      component.selectedFile = file1
      component.changeFile([file2])
      expect(component.selectedFile).toBe(file2)
    })
  })

  describe('submit', () => {
    it('should show error when file tab selected but no file chosen', () => {
      component.currentTabIndex = 1
      component.selectedFile = null
      component.submit()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Please upload your answer', undefined, { duration: 1000 })
      expect(component.fetchingStatus).toBe('fetched')
      expect(component.submitData.isSubmit).toBe(false)
    })

    it('should show error when file type is unsupported', () => {
      component.currentTabIndex = 1
      component.selectedFile = new File(['abc'], 'a.txt', { type: 'text/plain' })
      const resetSpy = jest.spyOn(component, 'reset')
      component.submit()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid File Type', undefined, { duration: 1000 })
      expect(resetSpy).toHaveBeenCalled()
    })

    it('should createContentDirectory when a valid pdf file is selected', () => {
      component.currentTabIndex = 1
      component.selectedFile = new File(['abc'], 'a.pdf', { type: 'application/pdf' })
      const createSpy = jest.spyOn(component, 'createContentDirectory').mockImplementation()
      component.submit()
      expect(createSpy).toHaveBeenCalledWith(component.selectedFile)
    })

    it('should show error when text answer is shorter than 10 chars', () => {
      component.currentTabIndex = 0
      component.answerControl.setValue('short')
      component.submit()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Please enter your answer', undefined, { duration: 1000 })
      expect(component.submitData.isSubmit).toBe(false)
    })

    it('should createContentDirectory when text answer is long enough', () => {
      component.currentTabIndex = 0
      component.answerControl.setValue('this is a long enough answer')
      const createSpy = jest.spyOn(component, 'createContentDirectory').mockImplementation()
      component.submit()
      expect(createSpy).toHaveBeenCalled()
    })
  })

  describe('reset', () => {
    it('should clear selectedFile for file tab', () => {
      component.currentTabIndex = 1
      component.selectedFile = new File(['abc'], 'a.pdf')
      component.reset()
      expect(component.selectedFile).toBeNull()
    })

    it('should reset answerControl for text tab', () => {
      component.currentTabIndex = 0
      component.answerControl.setValue('something')
      component.reset()
      expect(component.answerControl.value).toBeNull()
    })
  })

  describe('createContentDirectory', () => {
    it('should call uploadFile on success', () => {
      const file = new File(['abc'], 'a.pdf')
      const uploadSpy = jest.spyOn(component, 'uploadFile').mockImplementation()
      component.createContentDirectory(file)
      expect(uploadSpy).toHaveBeenCalledWith(file)
      expect(component.submitData.value).toBe(50)
    })

    it('should call uploadFile when error status is 409', () => {
      mockResourceSvc.createContentDirectory.mockReturnValue(throwError(() => ({ status: 409 })))
      const file = new File(['abc'], 'a.pdf')
      const uploadSpy = jest.spyOn(component, 'uploadFile').mockImplementation()
      component.createContentDirectory(file)
      expect(uploadSpy).toHaveBeenCalledWith(file)
    })

    it('should show error message on other errors', () => {
      mockResourceSvc.createContentDirectory.mockReturnValue(throwError(() => ({ status: 500 })))
      const file = new File(['abc'], 'a.pdf')
      component.createContentDirectory(file)
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error creating content directory', undefined, { duration: 3000 })
      expect(component.submitData.isSubmit).toBe(false)
    })
  })

  describe('uploadFile', () => {
    it('should postSubmission and refresh on successful upload', () => {
      mockResourceSvc.uploadFile.mockReturnValue(of({ contentUrl: 'url-1' }))
      mockResourceSvc.postSubmission.mockReturnValue(of({ response: 'Success' }))
      const getAllSpy = jest.spyOn(component, 'getAllSubmissions').mockImplementation()
      const resetSpy = jest.spyOn(component, 'reset').mockImplementation()
      const file = new File(['abc'], 'a.pdf', { type: 'application/pdf' })
      component.uploadFile(file)
      expect(mockResourceSvc.postSubmission).toHaveBeenCalled()
      expect(component.message).toBe('Submitted Successfully')
      expect(getAllSpy).toHaveBeenCalled()
      expect(resetSpy).toHaveBeenCalled()
    })

    it('should show error message when postSubmission fails', () => {
      mockResourceSvc.uploadFile.mockReturnValue(of({ contentUrl: 'url-1' }))
      mockResourceSvc.postSubmission.mockReturnValue(throwError(() => new Error('fail')))
      const file = new File(['abc'], 'a.pdf', { type: 'application/pdf' })
      component.uploadFile(file)
      expect(component.message).toBe('Error submitting file')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error submitting file', undefined, { duration: 3000 })
    })

    it('should not postSubmission when contentUrl is missing', () => {
      mockResourceSvc.uploadFile.mockReturnValue(of({}))
      const file = new File(['abc'], 'a.pdf', { type: 'application/pdf' })
      component.uploadFile(file)
      expect(mockResourceSvc.postSubmission).not.toHaveBeenCalled()
    })

    it('should show error message when upload fails', () => {
      mockResourceSvc.uploadFile.mockReturnValue(throwError(() => new Error('fail')))
      const file = new File(['abc'], 'a.pdf', { type: 'application/pdf' })
      component.uploadFile(file)
      expect(component.message).toBe('Error uploading file')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error uploading file', undefined, { duration: 3000 })
    })
  })

  describe('ngOnInit', () => {
    it('should call getAllSubmissions', () => {
      const getAllSpy = jest.spyOn(component, 'getAllSubmissions').mockImplementation()
      component.ngOnInit()
      expect(getAllSpy).toHaveBeenCalled()
    })
  })

  describe('openDialog', () => {
    it('should open with auto height for non-video type', () => {
      component.openDialog('url', 'application/pdf', 'time')
      expect(component.dialogHeight).toBe('auto')
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should open with 80% height for mp4 type', () => {
      component.openDialog('url', 'video/mp4', 'time')
      expect(component.dialogHeight).toBe('80%')
    })
  })

  describe('getAllSubmissions', () => {
    it('should set fetched status when there is no data', () => {
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: [] }))
      component.getAllSubmissions()
      expect(component.fetchingStatus).toBe('fetched')
      expect(component.submissionData).toEqual([])
    })

    it('should populate submissionData when response has data', () => {
      const data = [{ id: 1 }, { id: 2 }]
      mockResourceSvc.getAllSubmission.mockReturnValue(of({ response: data }))
      component.getAllSubmissions()
      expect(component.submissionData).toEqual(data)
      expect(component.fetchingStatus).toBe('fetched')
    })
  })
})

import { ViewerDataService } from './viewer-data.service'

describe('ViewerDataService', () => {
  let service: ViewerDataService

  beforeEach(() => {
    service = new ViewerDataService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('reset sets resourceId/status/primaryCategory, clears resource/error, resets gating and emits changedSubject', done => {
    service.gatingEnabled = true
    service.changedSubject.subscribe(() => done())
    service.reset('res-1', 'pending', 'Course')
    expect(service.resourceId).toBe('res-1')
    expect(service.resource).toBeNull()
    expect(service.error).toBeNull()
    expect(service.status).toBe('pending')
    expect(service.primaryCategory).toBe('Course')
    expect(service.gatingEnabled).toBe(false)
  })

  it('reset defaults status to none and primaryCategory to empty string', () => {
    service.reset('res-1')
    expect(service.status).toBe('none')
    expect(service.primaryCategory).toBe('')
  })

  it('updateResource sets resource/resourceId/primaryCategory and status done on success', done => {
    const resource: any = { identifier: 'res-2', primaryCategory: 'Learning Resource' }
    service.changedSubject.subscribe(() => done())
    service.updateResource(resource, null)
    expect(service.resource).toBe(resource)
    expect(service.resourceId).toBe('res-2')
    expect(service.primaryCategory).toBe('Learning Resource')
    expect(service.error).toBeNull()
    expect(service.status).toBe('done')
  })

  it('updateResource sets error and status error when resource is null', () => {
    const err = { status: 404 }
    service.updateResource(null, err)
    expect(service.resource).toBeNull()
    expect(service.error).toBe(err)
    expect(service.status).toBe('error')
  })

  it('updateNextPrevResource emits a mapped IViewerTocChangeEvent on tocChangeSubject', done => {
    service.tocChangeSubject.subscribe(event => {
      expect(event).toEqual({
        tocAvailable: true,
        nextResource: '/viewer/pdf/res-2',
        prevResource: '/viewer/pdf/res-1',
        previousTitle: 'prev',
        nextResTitle: 'next',
        currentCompletionPercentage: 40,
        prevCompletionPercentage: 100,
      })
      done()
    })
    service.updateNextPrevResource({
      isValid: true,
      prev: '/viewer/pdf/res-1',
      prevTitle: 'prev',
      nextTitle: 'next',
      next: '/viewer/pdf/res-2',
      currentPercentage: 40,
      prevPercentage: 100,
    })
  })

  it('changeFullScreen emits on fullScreenResource / getFullScreenStatus', done => {
    service.getFullScreenStatus.subscribe(isFullScreen => {
      expect(isFullScreen).toBe(true)
      done()
    })
    service.changeFullScreen(true)
  })

  it('getNode/setNode toggle the gatingEnabled flag', () => {
    expect(service.getNode()).toBe(false)
    service.setNode(true)
    expect(service.getNode()).toBe(true)
  })
})

import { HeaderServiceService } from './header-service.service'

describe('HeaderServiceService', () => {
  let service: HeaderServiceService

  beforeEach(() => {
    service = new HeaderServiceService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('isSavePressed defaults to true', () => {
    expect(service.isSavePressed).toBe(true)
  })

  it('saveCourseContent emits on headerSaveData', () => {
    let received: boolean | undefined
    service.headerSaveData.subscribe(v => received = v)
    service.saveCourseContent()
    expect(received).toBe(true)
  })

  it('headerSaveData updates isSavePressed on emission', () => {
    service.headerSaveData.next(false)
    expect(service.isSavePressed).toBe(false)
  })

  describe('showCreatorHeader', () => {
    it('emits course name when name is not "showlogo"', () => {
      let emitted: any
      service.showCourseHeader.subscribe(v => emitted = v)
      service.showCreatorHeader('My Course')
      expect(emitted).toBe('My Course')
    })

    it('emits "Course Name" as default when name is empty string', () => {
      let emitted: any
      service.showCourseHeader.subscribe(v => emitted = v)
      service.showCreatorHeader('')
      expect(emitted).toBe('Course Name')
    })

    it('emits empty string when name is "showlogo"', () => {
      let emitted: any
      service.showCourseHeader.subscribe(v => emitted = v)
      service.showCreatorHeader('showlogo')
      expect(emitted).toBe('')
    })
  })
})

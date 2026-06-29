jest.mock('../../../constants/apiConstants', () => ({
  API_END_POINTS: {
    SEARCH_V7PUBLIC: '/apis/public/v8/content/search',
  },
}))

import { of, throwError } from 'rxjs'
import { PublicCourseBlogComponent } from './public-course-blog.component'

describe('PublicCourseBlogComponent', () => {
  let component: PublicCourseBlogComponent
  let mockRoute: any
  let mockRouter: any
  let mockHttp: any
  let mockSeoSvc: any

  const mockCourse = {
    identifier: 'course-123',
    name: 'Test Course',
    description: 'A test course',
    sourceName: 'Aastrika',
    subject: ['Nursing', 'Health'],
    medium: 'en',
    appIcon: '',
  }

  beforeEach(() => {
    mockRoute = {
      snapshot: { paramMap: { get: jest.fn().mockReturnValue('course-123') } },
    }
    mockRouter = { navigate: jest.fn() }
    mockHttp = {
      post: jest.fn().mockReturnValue(of({ result: { content: [mockCourse] } })),
    }
    mockSeoSvc = { update: jest.fn() }
    component = new PublicCourseBlogComponent(mockRoute, mockRouter, mockHttp, mockSeoSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default course to null, isLoading to true, notFound to false', () => {
    expect(component.course).toBeNull()
    expect(component.isLoading).toBe(true)
    expect(component.notFound).toBe(false)
  })

  it('should set notFound and stop loading when courseId is empty', () => {
    mockRoute.snapshot.paramMap.get.mockReturnValue('')
    component.ngOnInit()
    expect(component.notFound).toBe(true)
    expect(component.isLoading).toBe(false)
    expect(mockHttp.post).not.toHaveBeenCalled()
  })

  it('should fetch course and set it on success', () => {
    component.ngOnInit()
    expect(mockHttp.post).toHaveBeenCalled()
    expect(component.course).toEqual(mockCourse)
    expect(component.isLoading).toBe(false)
    expect(component.notFound).toBe(false)
  })

  it('should set notFound when content array is empty', () => {
    mockHttp.post.mockReturnValue(of({ result: { content: [] } }))
    component.ngOnInit()
    expect(component.notFound).toBe(true)
    expect(component.isLoading).toBe(false)
  })

  it('should set notFound on http error', () => {
    mockHttp.post.mockReturnValue(throwError(() => new Error('Network error')))
    component.ngOnInit()
    expect(component.notFound).toBe(true)
    expect(component.isLoading).toBe(false)
  })

  it('should call seoSvc.update after fetching course', () => {
    component.ngOnInit()
    expect(mockSeoSvc.update).toHaveBeenCalledWith(expect.objectContaining({ ogType: 'article' }))
  })

  it('should navigate to /public/toc/overview/:id on enrollNow()', () => {
    component.course = mockCourse
    component.enrollNow()
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/public/toc/overview/course-123`])
  })

  it('should navigate to /public/home on goToHome()', () => {
    component.goToHome()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/public/home'])
  })

  describe('getKeywordsString', () => {
    it('should build a comma-separated keyword string', () => {
      const result = component.getKeywordsString({ name: 'Nursing 101', sourceName: 'Aastrika', subject: ['Health'] })
      expect(result).toContain('Nursing 101')
      expect(result).toContain('Aastrika')
      expect(result).toContain('Health')
      expect(result).toContain('Aastrika Sphere')
    })
  })

  describe('getDurationHours', () => {
    it('should return empty string for 0 seconds', () => {
      expect(component.getDurationHours(0)).toBe('')
    })
    it('should format hours and minutes', () => {
      expect(component.getDurationHours(3900)).toBe('1h 5m')
    })
    it('should format whole hours', () => {
      expect(component.getDurationHours(7200)).toBe('2 hours')
    })
    it('should format minutes only', () => {
      expect(component.getDurationHours(600)).toBe('10 min')
    })
  })

  describe('getLanguageLabel', () => {
    it('should return English for "en"', () => {
      expect(component.getLanguageLabel('en')).toBe('English')
    })
    it('should return Hindi for "hi"', () => {
      expect(component.getLanguageLabel('hi')).toBe('Hindi')
    })
    it('should return the raw code for unknown lang', () => {
      expect(component.getLanguageLabel('fr')).toBe('fr')
    })
    it('should use first element of array', () => {
      expect(component.getLanguageLabel(['ta', 'en'])).toBe('Tamil')
    })
  })

  describe('getKeywordsList', () => {
    it('should return subject items when only subject is provided', () => {
      const result = component.getKeywordsList({ subject: 'Nursing' })
      expect(result).toContain('Nursing')
    })

    it('should split string keywords and trim each item via map callback', () => {
      const result = component.getKeywordsList({ keywords: 'health, care , wellness' })
      expect(result).toContain('health')
      expect(result).toContain('care')
      expect(result).toContain('wellness')
    })

    it('should handle array keywords via map callback', () => {
      const result = component.getKeywordsList({ keywords: ['health', ' care '] })
      expect(result).toContain('health')
      expect(result).toContain('care')
    })

    it('should return empty array when neither subject nor keywords provided', () => {
      const result = component.getKeywordsList({})
      expect(result).toEqual([])
    })

    it('should combine subject and keywords and deduplicate', () => {
      const result = component.getKeywordsList({ subject: 'Nursing', keywords: 'Nursing, care' })
      const nursingCount = result.filter((k: string) => k === 'Nursing').length
      expect(nursingCount).toBe(1)
      expect(result).toContain('care')
    })
  })

  describe('formatDate', () => {
    it('should return empty string for falsy input', () => {
      expect(component.formatDate('')).toBe('')
    })
    it('should return empty string for invalid date', () => {
      expect(component.formatDate('not-a-date')).toBe('')
    })
    it('should return a formatted date string for a valid date', () => {
      const result = component.formatDate('2024-01-15')
      expect(result).toContain('2024')
    })
  })
})

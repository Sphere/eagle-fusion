import { PipeNameTransformPipe } from './pipe-name-transform.pipe'

describe('PipeNameTransformPipe', () => {
  let pipe: PipeNameTransformPipe

  beforeEach(() => {
    pipe = new PipeNameTransformPipe()
  })

  it('should create', () => {
    expect(pipe).toBeTruthy()
  })

  it('should join first and last name', () => {
    expect(pipe.transform({ firstName: 'Ada', lastName: 'Lovelace', email: 'a@b.com' })).toBe('Ada Lovelace')
  })

  it('should skip the last name when it duplicates the first name', () => {
    expect(pipe.transform({ firstName: 'Ada', lastName: 'Ada', email: 'a@b.com' })).toBe('Ada')
  })

  it('should return only the first name when the last name is missing', () => {
    expect(pipe.transform({ firstName: 'Ada', lastName: '', email: 'a@b.com' })).toBe('Ada')
  })

  it('should return only the last name when the first name is missing', () => {
    expect(pipe.transform({ firstName: '', lastName: 'Lovelace', email: 'a@b.com' })).toBe(' Lovelace')
  })

  it('should fall back to the email when no name is present', () => {
    expect(pipe.transform({ firstName: '', lastName: '', email: 'a@b.com' })).toBe('a@b.com')
  })

  it('should fall back to "Anonymous User" when nothing is present', () => {
    expect(pipe.transform({ firstName: '', lastName: '', email: '' })).toBe('Anonymous User')
  })
})

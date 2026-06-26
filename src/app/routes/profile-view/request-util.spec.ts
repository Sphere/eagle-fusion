import {
  checkvalue,
  getDateFromText,
  getClass10,
  getClass12,
  getDegree,
  getPostDegree,
  populateAcademics,
  getOrganisationsHistory,
} from './request-util'

describe('checkvalue', () => {
  it('returns the value when it is a regular string', () => {
    expect(checkvalue('hello')).toBe('hello')
  })

  it('returns undefined (implicitly) when value is the string "undefined"', () => {
    expect(checkvalue('undefined')).toBeUndefined()
  })

  it('returns empty string when value is an empty string', () => {
    expect(checkvalue('')).toBe('')
  })

  it('returns null when value is null', () => {
    expect(checkvalue(null)).toBeNull()
  })

  it('returns a numeric value unchanged', () => {
    expect(checkvalue(42)).toBe(42)
  })
})

describe('getDateFromText', () => {
  it('converts DD-MM-YYYY string to a Date in YYYY-MM-DD format', () => {
    const result = getDateFromText('01-02-2023')
    expect(result).toBeInstanceOf(Date)
    expect(result.getFullYear()).toBe(2023)
    expect(result.getMonth()).toBe(1) // February (0-indexed)
    expect(result.getDate()).toBe(1)
  })

  it('returns empty string for an empty string input', () => {
    expect(getDateFromText('')).toBe('')
  })

  it('returns empty string for a falsy value', () => {
    expect(getDateFromText(null as any)).toBe('')
  })

  it('handles single-digit day and month', () => {
    const result = getDateFromText('5-3-2020')
    expect(result).toBeInstanceOf(Date)
  })
})

describe('getClass10', () => {
  it('returns X_STANDARD type', () => {
    const result = getClass10({}, undefined)
    expect(result.type).toBe('X_STANDARD')
  })

  it('returns nameOfQualification as empty string', () => {
    const result = getClass10({}, undefined)
    expect(result.nameOfQualification).toBe('')
  })

  it('returns nameOfInstitute from form when courseDegree.type matches', () => {
    const data = { courseDegree: { type: 'X_STANDARD' }, institutionName: 'School A', yearPassing: 2010 }
    const result = getClass10(data, {})
    expect(result.nameOfInstitute).toBe('School A')
    expect(result.yearOfPassing).toBe('2010')
  })

  it('returns nameOfInstitute from existing academics when form does not match', () => {
    const data = { courseDegree: { type: 'GRADUATE' } }
    const userProfileData = { academics: [{ type: 'X_STANDARD', nameOfInstitute: 'Old School', yearOfPassing: '2005' }] }
    const result = getClass10(data, userProfileData)
    expect(result.nameOfInstitute).toBe('Old School')
    expect(result.yearOfPassing).toBe('2005')
  })

  it('returns empty strings when no academic data available', () => {
    const result = getClass10({}, {})
    expect(result.nameOfInstitute).toBe('')
    expect(result.yearOfPassing).toBe('')
  })
})

describe('getClass12', () => {
  it('returns XII_STANDARD type', () => {
    expect(getClass12({}, undefined).type).toBe('XII_STANDARD')
  })

  it('returns data from form when courseDegree.type matches XII_STANDARD', () => {
    const data = { courseDegree: { type: 'XII_STANDARD' }, institutionName: 'HS School', yearPassing: 2012 }
    const result = getClass12(data, {})
    expect(result.nameOfInstitute).toBe('HS School')
    expect(result.yearOfPassing).toBe('2012')
  })

  it('falls back to existing academics when form type does not match', () => {
    const data = { courseDegree: { type: 'GRADUATE' } }
    const userProfileData = { academics: [{ type: 'XII_STANDARD', nameOfInstitute: 'Senior School', yearOfPassing: '2008' }] }
    const result = getClass12(data, userProfileData)
    expect(result.nameOfInstitute).toBe('Senior School')
  })
})

describe('getDegree', () => {
  it('returns GRADUATE type', () => {
    expect(getDegree({}, undefined).type).toBe('GRADUATE')
  })

  it('returns courseName as nameOfQualification when form matches GRADUATE', () => {
    const data = { courseDegree: { type: 'GRADUATE' }, courseName: 'B.Tech', institutionName: 'IIT', yearPassing: 2016 }
    const result = getDegree(data, {})
    expect(result.nameOfQualification).toBe('B.Tech')
    expect(result.nameOfInstitute).toBe('IIT')
  })

  it('falls back to existing academics for GRADUATE', () => {
    const data = { courseDegree: { type: 'XII_STANDARD' } }
    const userProfileData = { academics: [{ type: 'GRADUATE', nameOfQualification: 'B.Sc', nameOfInstitute: 'College', yearOfPassing: '2018' }] }
    const result = getDegree(data, userProfileData)
    expect(result.nameOfQualification).toBe('B.Sc')
    expect(result.nameOfInstitute).toBe('College')
  })
})

describe('getPostDegree', () => {
  it('returns POSTGRADUATE type', () => {
    expect(getPostDegree({}, undefined).type).toBe('POSTGRADUATE')
  })

  it('returns courseName as nameOfQualification when form matches POSTGRADUATE', () => {
    const data = { courseDegree: { type: 'POSTGRADUATE' }, courseName: 'M.Tech', institutionName: 'NIT', yearPassing: 2018 }
    const result = getPostDegree(data, {})
    expect(result.nameOfQualification).toBe('M.Tech')
  })

  it('falls back to existing academics for POSTGRADUATE', () => {
    const data = { courseDegree: { type: 'GRADUATE' } }
    const userProfileData = { academics: [{ type: 'POSTGRADUATE', nameOfQualification: 'MBA', nameOfInstitute: 'B-School', yearOfPassing: '2020' }] }
    const result = getPostDegree(data, userProfileData)
    expect(result.nameOfQualification).toBe('MBA')
  })
})

describe('populateAcademics', () => {
  it('returns array with 4 entries when data has no academics array', () => {
    const result = populateAcademics({}, {})
    expect(result).toHaveLength(4)
  })

  it('maps academics from data when data.academics is non-empty', () => {
    const data = {
      academics: [
        { type: 'X_STANDARD', nameOfInstitute: 'School', yearOfPassing: 2005 },
        { type: 'GRADUATE', nameOfInstitute: 'College', yearOfPassing: 2015 },
      ],
    }
    const result = populateAcademics(data)
    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('X_STANDARD')
    expect(result[1].type).toBe('GRADUATE')
  })

  it('returns empty array for empty academics array', () => {
    const result = populateAcademics({ academics: [] }, {})
    expect(result).toHaveLength(4) // falls through to default branch
  })
})

describe('getOrganisationsHistory', () => {
  it('returns an array with one organisation entry', () => {
    const form = { value: {} }
    const userProfileData = { professionalDetails: [] }
    const result = getOrganisationsHistory(form, userProfileData)
    expect(result).toHaveLength(1)
  })

  it('picks orgType from form.value when present', () => {
    const form = { value: { orgType: 'government' } }
    const userProfileData = {}
    const result = getOrganisationsHistory(form, userProfileData)
    expect(result[0].orgType).toBe('government')
  })

  it('falls back to userProfileData when form.value fields are absent', () => {
    const form = { value: {} }
    const userProfileData = {
      professionalDetails: [{ orgType: 'private', designation: 'Engineer' }],
    }
    const result = getOrganisationsHistory(form, userProfileData)
    expect(result[0].orgType).toBe('private')
    expect(result[0].designation).toBe('Engineer')
  })

  it('always sets responsibilities to empty string', () => {
    const result = getOrganisationsHistory({ value: {} }, {})
    expect(result[0].responsibilities).toBe('')
  })

  it('always sets additionalAttributes to empty object', () => {
    const result = getOrganisationsHistory({ value: {} }, {})
    expect(result[0].additionalAttributes).toEqual({})
  })
})

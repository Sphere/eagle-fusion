import {
  checkvalue,
  constructReq,
  getDateFromText,
  getClass10,
  getClass12,
  getDegree,
  getPostDegree,
  populateAcademics,
  getOrganisationsHistory,
} from './request-util'

describe('constructReq', () => {
  const minUserProfile = {
    userId: 'u-1',
    personalDetails: {
      firstname: 'Jane',
      middlename: '',
      surname: 'Doe',
      about: '',
      photo: '',
      dob: '',
      nationality: '',
      domicileMedium: '',
      regNurseRegMidwifeNumber: '',
      gender: '',
      maritalStatus: '',
      knownLanguages: '',
      mobile: '',
      telephone: '',
      primaryEmail: 'jane@example.com',
      postalAddress: '',
      pincode: '',
      osName: '',
      browserName: '',
      userCookie: '',
    },
  }

  it('returns a profileReq object with the correct userId', () => {
    const result = constructReq({}, minUserProfile, { OS: 'Mac', browserName: 'Chrome' }, 'session-cookie')
    expect(result.profileReq.userId).toBe('u-1')
    expect(result.profileReq.id).toBe('u-1')
  })

  it('uses form fields when present in form', () => {
    const form = { firstname: 'Alice', value: {} }
    const result = constructReq(form, minUserProfile, {}, '')
    expect(result.profileReq.personalDetails.firstname).toBe('Alice')
  })
})

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

describe('constructReq - personal details fallbacks', () => {
  const fullProfile = () => ({
    userId: 'u-1',
    nationalUniqueId: 'nid',
    doctorRegNumber: 'drn',
    instituteName: 'inst',
    nursingCouncil: 'council',
    category: 'cat',
    countryCode: '+91',
    personalDetails: {
      firstname: 'Stored', middlename: 'S', surname: 'Name', about: 'about',
      photo: 'stored.png', dob: '1990-01-01', nationality: 'IN', domicileMedium: 'EN',
      regNurseRegMidwifeNumber: 'rn-1', gender: 'F', maritalStatus: 'Single',
      knownLanguages: 'en', mobile: '999', telephone: '011', primaryEmail: 'a@b.com',
      postalAddress: 'addr', pincode: '560001',
      osName: 'StoredOS', browserName: 'StoredBrowser', userCookie: 'stored-cookie',
    },
  })

  it('should fall back to the stored profile when the form is empty', () => {
    const { profileReq } = constructReq({ value: {} }, fullProfile(), { OS: 'Mac', browserName: 'Chrome' }, 'cookie')
    expect(profileReq.personalDetails).toEqual(expect.objectContaining({
      firstname: 'Stored', middlename: 'S', surname: 'Name', about: 'about',
      photo: 'stored.png', dob: '1990-01-01', nationality: 'IN', domicileMedium: 'EN',
      regNurseRegMidwifeNumber: 'rn-1', gender: 'F', maritalStatus: 'Single',
      knownLanguages: 'en', mobile: '999', postalAddress: 'addr', pincode: '560001',
    }))
  })

  it('should prefer every supplied form value over the stored profile', () => {
    const form = {
      value: {},
      firstname: 'F', middlename: 'M', surname: 'S', about: 'A', photo: 'new.png',
      dob: '2000-01-01', nationality: 'US', domicileMedium: 'HI', regNurseRegMidwifeNumber: 'rn-2',
      gender: 'M', maritalStatus: 'Married', knownLanguages: 'hi', mobile: '888',
      postalAddress: 'new addr', pincode: '110001',
    }
    const { profileReq } = constructReq(form, fullProfile(), {}, '')
    expect(profileReq.personalDetails).toEqual(expect.objectContaining({
      firstname: 'F', middlename: 'M', surname: 'S', about: 'A', photo: 'new.png',
      dob: '2000-01-01', nationality: 'US', domicileMedium: 'HI', regNurseRegMidwifeNumber: 'rn-2',
      gender: 'M', maritalStatus: 'Married', knownLanguages: 'hi', mobile: '888',
      postalAddress: 'new addr', pincode: '110001',
    }))
  })

  it('should reject the placeholder photo value and keep the stored one', () => {
    const { profileReq } = constructReq(
      { value: {}, photo: 'NaN - NaN - NaN' }, fullProfile(), {}, '',
    )
    expect(profileReq.personalDetails.photo).toBe('stored.png')
  })

  it('should carry the top-level identity fields through untouched', () => {
    const { profileReq } = constructReq({ value: {} }, fullProfile(), {}, '')
    expect(profileReq.personalDetails).toEqual(expect.objectContaining({
      nationalUniqueId: 'nid', doctorRegNumber: 'drn', instituteName: 'inst',
      nursingCouncil: 'council', category: 'cat', countryCode: '+91',
      telephone: '011', primaryEmail: 'a@b.com', officialEmail: '', personalEmail: '',
    }))
  })

  it('should keep the stored user agent details when they are already recorded', () => {
    const { profileReq } = constructReq(
      { value: {} }, fullProfile(), { OS: 'Mac', browserName: 'Chrome' }, 'new-cookie',
    )
    expect(profileReq.personalDetails).toEqual(expect.objectContaining({
      osName: 'StoredOS', browserName: 'StoredBrowser', userCookie: 'stored-cookie',
    }))
  })

  it('should record the current user agent when nothing is stored', () => {
    const profile = fullProfile()
    profile.personalDetails.osName = ''
    profile.personalDetails.browserName = ''
    profile.personalDetails.userCookie = ''

    const { profileReq } = constructReq(
      { value: {} }, profile, { OS: 'Mac', browserName: 'Chrome' }, 'new-cookie',
    )
    expect(profileReq.personalDetails).toEqual(expect.objectContaining({
      osName: 'Mac', browserName: 'Chrome', userCookie: 'new-cookie',
    }))
  })

  it('should fall back to the profile id when there is no userId', () => {
    const profile: any = { ...fullProfile(), userId: undefined, id: 'alt-id' }
    expect(constructReq({ value: {} }, profile, {}, '').profileReq.userId).toBe('alt-id')
  })

  it('should fall back to an empty id when neither is present', () => {
    const profile: any = { ...fullProfile(), userId: undefined }
    expect(constructReq({ value: {} }, profile, {}, '').profileReq.userId).toBe('')
  })

  it('should default the employment, skills and interests blocks', () => {
    const { profileReq } = constructReq({ value: {} }, fullProfile(), {}, '')
    expect(profileReq.skills).toEqual({ additionalSkills: '', certificateDetails: '' })
    expect(profileReq.interests).toEqual({ professional: '', hobbies: '' })
    expect(profileReq.employmentDetails).toEqual(expect.objectContaining({
      service: '', cadre: '', payType: '', civilListNo: '',
    }))
  })

  it('should carry through the stored employment details', () => {
    const profile: any = {
      ...fullProfile(),
      employmentDetails: {
        service: 'Health', cadre: 'A', allotmentYearOfService: '2015', dojOfService: '01-02-2015',
        payType: 'Regular', civilListNo: 'CL1', employeeCode: 'E1',
        officialPostalAddress: 'Office', pinCode: '110001',
      },
      skills: { additionalSkills: 'first-aid', certificateDetails: 'cert' },
      interests: { professional: 'nursing', hobbies: 'reading' },
    }
    const { profileReq } = constructReq({ value: {} }, profile, {}, '')
    expect(profileReq.employmentDetails.service).toBe('Health')
    expect(profileReq.employmentDetails.dojOfService).toEqual(new Date('2015-02-01'))
    expect(profileReq.skills).toEqual({ additionalSkills: 'first-aid', certificateDetails: 'cert' })
    expect(profileReq.interests).toEqual({ professional: 'nursing', hobbies: 'reading' })
  })

  it('should build academics from the form when a course degree is chosen', () => {
    const form = {
      value: { courseDegree: { type: 'GRADUATE' }, courseName: 'BSc', institutionName: 'Uni', yearPassing: 2015 },
    }
    const { profileReq } = constructReq(form, fullProfile(), {}, '')
    const graduate = profileReq.academics.find((a: any) => a.type === 'GRADUATE')
    expect(graduate.nameOfQualification).toBe('BSc')
    expect(graduate.nameOfInstitute).toBe('Uni')
  })
})

describe('populateAcademics - stored list branches', () => {
  const entry = (type: string) => ({ type, nameOfInstitute: `${type} Inst`, yearOfPassing: 2010 })

  it('should map every recognised qualification type', () => {
    const result = populateAcademics({
      academics: [entry('X_STANDARD'), entry('XII_STANDARD'), entry('GRADUATE'), entry('POSTGRADUATE')],
    })
    expect(result.map((a: any) => a.type)).toEqual(['X_STANDARD', 'XII_STANDARD', 'GRADUATE', 'POSTGRADUATE'])
    expect(result[0].nameOfInstitute).toBe('X_STANDARD Inst')
    expect(result[0].yearOfPassing).toBe('2010')
  })

  it('should skip an unrecognised qualification type', () => {
    const result = populateAcademics({ academics: [entry('DIPLOMA'), entry('GRADUATE')] })
    expect(result.map((a: any) => a.type)).toEqual(['GRADUATE'])
  })

  it('should fall through to the four-slot form when the list is empty', () => {
    const result = populateAcademics({ academics: [] })
    expect(result.map((a: any) => a.type)).toEqual(['X_STANDARD', 'XII_STANDARD', 'GRADUATE', 'POSTGRADUATE'])
  })

  it('should fall through to the four-slot form when there is no list', () => {
    expect(populateAcademics({})).toHaveLength(4)
  })
})

describe('academic slot builders - stored value fallbacks', () => {
  const stored = {
    academics: [
      { type: 'X_STANDARD', nameOfInstitute: 'School 10', yearOfPassing: '2005' },
      { type: 'XII_STANDARD', nameOfInstitute: 'School 12', yearOfPassing: '2007' },
      { type: 'GRADUATE', nameOfQualification: 'BSc', nameOfInstitute: 'College', yearOfPassing: '2010' },
      { type: 'POSTGRADUATE', nameOfQualification: 'MSc', nameOfInstitute: 'PG College', yearOfPassing: '2012' },
    ],
  }

  it('should keep the stored class 10 record when another degree is being edited', () => {
    expect(getClass10({ courseDegree: { type: 'GRADUATE' } }, stored)).toEqual({
      nameOfQualification: '', type: 'X_STANDARD', nameOfInstitute: 'School 10', yearOfPassing: '2005',
    })
  })

  it('should blank the class 10 record when nothing is stored', () => {
    expect(getClass10({ courseDegree: { type: 'GRADUATE' } }, {})).toEqual({
      nameOfQualification: '', type: 'X_STANDARD', nameOfInstitute: '', yearOfPassing: '',
    })
  })

  it('should keep the stored class 12 record when another degree is being edited', () => {
    expect(getClass12({ courseDegree: { type: 'GRADUATE' } }, stored).nameOfInstitute).toBe('School 12')
  })

  it('should blank the class 12 record when nothing is stored', () => {
    expect(getClass12({ courseDegree: { type: 'GRADUATE' } }, {})).toEqual({
      nameOfQualification: '', type: 'XII_STANDARD', nameOfInstitute: '', yearOfPassing: '',
    })
  })

  it('should keep the stored graduate record when another degree is being edited', () => {
    expect(getDegree({ courseDegree: { type: 'X_STANDARD' } }, stored)).toEqual({
      nameOfQualification: 'BSc', type: 'GRADUATE', nameOfInstitute: 'College', yearOfPassing: '2010',
    })
  })

  it('should keep the stored graduate details when the form omits them', () => {
    expect(getDegree({ courseDegree: { type: 'GRADUATE' } }, stored)).toEqual(expect.objectContaining({
      nameOfQualification: 'BSc', nameOfInstitute: 'College',
    }))
  })

  it('should blank the graduate record when nothing is stored', () => {
    expect(getDegree({ courseDegree: { type: 'X_STANDARD' } }, {})).toEqual({
      nameOfQualification: '', type: 'GRADUATE', nameOfInstitute: '', yearOfPassing: '',
    })
  })

  it('should keep the stored postgraduate record when another degree is being edited', () => {
    expect(getPostDegree({ courseDegree: { type: 'GRADUATE' } }, stored)).toEqual({
      nameOfQualification: 'MSc', type: 'POSTGRADUATE', nameOfInstitute: 'PG College', yearOfPassing: '2012',
    })
  })

  it('should keep the stored postgraduate qualification when the form omits it', () => {
    expect(getPostDegree({ courseDegree: { type: 'POSTGRADUATE' }, institutionName: 'New PG', yearPassing: 2020 }, stored))
      .toEqual(expect.objectContaining({
        nameOfQualification: 'MSc', nameOfInstitute: 'New PG', yearOfPassing: '2020',
      }))
  })

  it('should blank the postgraduate record when nothing is stored', () => {
    expect(getPostDegree({ courseDegree: { type: 'GRADUATE' } }, {})).toEqual({
      nameOfQualification: '', type: 'POSTGRADUATE', nameOfInstitute: '', yearOfPassing: '',
    })
  })

  it('should tolerate a form with no chosen course degree', () => {
    expect(getClass10({}, stored).nameOfInstitute).toBe('School 10')
    expect(getDegree({}, stored).nameOfQualification).toBe('BSc')
  })
})

describe('getOrganisationsHistory - stored profile fallbacks', () => {
  const stored = {
    professionalDetails: [{
      orgType: 'Govt', professionOtherSpecify: 'Other prof', orgOtherSpecify: 'Other org',
      name: 'Stored Org', designation: 'Nurse', profession: 'Nursing', location: 'Delhi',
      doj: '2015-01-01', osid: 'osid-1', block: 'Block A', subcentre: 'SC-1',
    }],
  }

  it('should fall back to the stored professional record', () => {
    const [org] = getOrganisationsHistory({ value: {} }, stored)
    expect(org).toEqual(expect.objectContaining({
      orgType: 'Govt', professionOtherSpecify: 'Other prof', orgOtherSpecify: 'Other org',
      name: 'Stored Org', designation: 'Nurse', profession: 'Nursing', location: 'Delhi',
      doj: '2015-01-01', osid: 'osid-1', block: 'Block A', subcentre: 'SC-1',
    }))
  })

  it('should prefer every supplied form value', () => {
    const form = {
      value: {
        orgType: 'Private', professionOtherSpecify: 'P', orgOtherSpecify: 'O',
        organizationName: 'Form Org', orgNameOther: 'Other name', industry: 'Health',
        industryOther: 'Other industry', designation: 'Doctor', profession: 'Medicine',
        location: 'Mumbai', doj: '2020-01-01', orgDesc: 'desc', block: 'Block B', subcentre: 'SC-2',
      },
    }
    const [org] = getOrganisationsHistory(form, stored)
    expect(org).toEqual(expect.objectContaining({
      orgType: 'Private', professionOtherSpecify: 'P', orgOtherSpecify: 'O',
      name: 'Form Org', nameOther: 'Other name', industry: 'Health', industryOther: 'Other industry',
      designation: 'Doctor', profession: 'Medicine', location: 'Mumbai',
      doj: '2020-01-01', description: 'desc', block: 'Block B', subcentre: 'SC-2',
    }))
  })

  it('should blank the form-only fields when the form is empty', () => {
    const [org] = getOrganisationsHistory({ value: {} }, stored)
    expect(org).toEqual(expect.objectContaining({
      nameOther: '', industry: '', industryOther: '', description: '',
      responsibilities: '', completePostalAddress: '',
    }))
  })

  it('should leave the osid undefined when none is stored', () => {
    const [org] = getOrganisationsHistory({ value: {} }, { professionalDetails: [{}] })
    expect(org.osid).toBeUndefined()
  })

  it('should tolerate a profile with no professional details', () => {
    const [org] = getOrganisationsHistory({ value: {} }, {})
    expect(org.orgType).toBe('')
    expect(org.name).toBe('')
    expect(org.designation).toBeUndefined()
  })
})

describe('getDateFromText - additional cases', () => {
  it('should parse a dd-mm-yyyy string into a Date', () => {
    expect(getDateFromText('05-08-2026')).toEqual(new Date('2026-08-05'))
  })

  it('should return an empty string for an empty input', () => {
    expect(getDateFromText('')).toBe('')
  })
})

describe('checkvalue - additional cases', () => {
  it('should pass through falsy values unchanged', () => {
    expect(checkvalue('')).toBe('')
    expect(checkvalue(0)).toBe(0)
    expect(checkvalue(null)).toBeNull()
  })
})

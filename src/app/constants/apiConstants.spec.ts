import { API_END_POINTS, S3_END_POINTS } from './apiConstants'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const PROXY_SLAG_V8 = '/apis/proxies/v8'
const PUBLIC_SLAG_V8 = '/apis/public/v8'

describe('API_END_POINTS', () => {
  describe('static endpoints', () => {
    it('exposes auth endpoints under the public slag', () => {
      expect(API_END_POINTS.KEYCLOAK_COOKIE).toBe(`${PUBLIC_SLAG_V8}/emailMobile/authv2`)
      expect(API_END_POINTS.LOGIN_USER).toBe(`${PUBLIC_SLAG_V8}/emailMobile/auth`)
      expect(API_END_POINTS.SIGNUP).toBe(`${PUBLIC_SLAG_V8}/emailMobile/signup`)
      expect(API_END_POINTS.GENERATE_OTP).toBe(`${PUBLIC_SLAG_V8}/emailMobile/generateOtp`)
      expect(API_END_POINTS.VALIDATE_OTP).toBe(`${PUBLIC_SLAG_V8}/emailMobile/validateOtp`)
    })

    it('exposes user endpoints under the protected slag', () => {
      expect(API_END_POINTS.USER_TNC).toBe(`${PROTECTED_SLAG_V8}/user/tnc`)
      expect(API_END_POINTS.TNC_ACCEPT).toBe(`${PROTECTED_SLAG_V8}/user/tnc/accept`)
      expect(API_END_POINTS.USER_ROLE).toBe(`${PROTECTED_SLAG_V8}/user/roles`)
      expect(API_END_POINTS.userPref).toBe(`${PROTECTED_SLAG_V8}/user/preference`)
      expect(API_END_POINTS.getDetails).toBe(`${PROTECTED_SLAG_V8}/user/details/detailV2`)
    })

    it('exposes course/batch endpoints under the proxies slag', () => {
      expect(API_END_POINTS.COURSE_BATCH_LIST).toBe(`${PROXY_SLAG_V8}/learner/course/v1/batch/list`)
      expect(API_END_POINTS.ENROLL_BATCH).toBe(`${PROXY_SLAG_V8}/learner/course/v1/enrol`)
      expect(API_END_POINTS.BATCH_CREATE).toBe(`${PROXY_SLAG_V8}/learner/course/v1/batch/create`)
      expect(API_END_POINTS.LOGOUT_USER).toBe(`${PROXY_SLAG_V8}/logout/user`)
      expect(API_END_POINTS.getLeaderBoardData).toBe(`${PROXY_SLAG_V8}/user/v1/leaderboard`)
    })

    it('points ASHA progress endpoints at learnerpathV2', () => {
      expect(API_END_POINTS.UPDATE_ASHA_PROGRESS).toBe(`${PROTECTED_SLAG_V8}/learnerpathV2`)
    })

    it('appends cache-busting params to FORM_READ and PLAYLIST_SEARCH', () => {
      expect(API_END_POINTS.FORM_READ).toMatch(/^\/apis\/v1\/form\/read\?v=\d+$/)
      expect(API_END_POINTS.PLAYLIST_SEARCH).toMatch(/^\/apis\/protected\/v8\/playlist\/search\?v=\d+$/)
    })

    it('exposes partner login endpoints under the public slag', () => {
      expect(API_END_POINTS.Sashakt_Auth).toBe(`${PUBLIC_SLAG_V8}/sashaktAuth/login`)
      expect(API_END_POINTS.Maternity_Auth).toBe(`${PUBLIC_SLAG_V8}/maternityFoundation/login`)
      expect(API_END_POINTS.Tnai_Auth).toBe(`${PUBLIC_SLAG_V8}/tnai/login`)
      expect(API_END_POINTS.MNC_Auth).toBe(`${PUBLIC_SLAG_V8}/mnc/login`)
      expect(API_END_POINTS.Tnnmc_Auth).toBe(`${PUBLIC_SLAG_V8}/tnnmc/login`)
    })

    it('exposes state registration endpoints under the public slag', () => {
      expect(API_END_POINTS.bnrcRegistration).toBe(`${PUBLIC_SLAG_V8}/bnrcUserCreation/createUser`)
      expect(API_END_POINTS.upsmfRegistration).toBe(`${PUBLIC_SLAG_V8}/upsmfUserCreation/createUser`)
      expect(API_END_POINTS.mpRegistration).toBe(`${PUBLIC_SLAG_V8}/mpNHMUserCreation/createUser`)
      expect(API_END_POINTS.mpValidateOtpRegistration).toBe(`${PUBLIC_SLAG_V8}/mpNHMUserCreation/otp/validateOtp`)
    })
  })

  describe('parameterised endpoints', () => {
    it('builds user-scoped URLs', () => {
      expect(API_END_POINTS.FETCH_USER_GROUPS('u1')).toBe(`${PROTECTED_SLAG_V8}/user/group/fetchUserGroup?userId=u1`)
      expect(API_END_POINTS.GET_ASHA_PROGRESS('u1')).toBe(`${PROTECTED_SLAG_V8}/learnerpathV2?userId=u1`)
      expect(API_END_POINTS.AUTOCOMPLETE('que')).toBe(`${PROTECTED_SLAG_V8}/user/autocomplete/que`)
    })

    it('builds enrollment list URLs for a user id', () => {
      const url = API_END_POINTS.FETCH_USER_ENROLLMENT_LIST('u1')
      expect(url).toContain(`${PROXY_SLAG_V8}/learner/course/v1/user/enrollment/list/u1?`)
      expect(url).toContain('orgdetails=orgName,email')

      const compUrl = API_END_POINTS.FETCH_USER_ENROLLMENT_LIST_COMP('u2')
      expect(compUrl).toContain('/enrollment/list/u2?')
      expect(compUrl).toContain('fields=competency,')

      const certUrl = API_END_POINTS.FETCH_USER_ENROLLMENT_LIST_CERT('u3')
      expect(certUrl).toContain('/enrollment/list/u3?')
      expect(certUrl).toContain('issueCertification')
    })

    it('builds enrollment list V2 URL from explicit field params', () => {
      const url = API_END_POINTS.FETCH_USER_ENROLLMENT_LIST_V2('u1', 'org', 'lic', 'f1,f2', 'b1')
      expect(url).toBe(`${PROXY_SLAG_V8}/learner/course/v1/user/enrollment/list/u1?orgdetails=org&licenseDetails=lic&fields=f1,f2&batchDetails=b1`)
    })

    it('builds the adhoc certificate URL', () => {
      expect(API_END_POINTS.FETCH_GENERAL_RC_CERTIFICATE()).toContain(`${PROTECTED_SLAG_V8}/rcCert/user/enrollment/list/adhocCertificates?`)
    })

    it('builds content URLs', () => {
      expect(API_END_POINTS.AUTH_CONTENT('a/b')).toBe('/apis/authContent/a/b')
      expect(API_END_POINTS.GET_CONTENT('c1')).toBe(`${PROTECTED_SLAG_V8}/content/c1?hierarchyType=minimal`)
      expect(API_END_POINTS.CONTENT_PARENT('c1')).toBe(`${PROTECTED_SLAG_V8}/content/c1/parent`)
      expect(API_END_POINTS.COLLECTION_HIERARCHY('minimal', 'id1')).toBe(`${PROTECTED_SLAG_V8}/content/collection/minimal/id1`)
      expect(API_END_POINTS.EXTERNAL_CONTENT('c1')).toBe(`${PROTECTED_SLAG_V8}/content/external-access/c1`)
      expect(API_END_POINTS.CONTENT_AUTH_PARENT('c1', 'root', 'org'))
        .toBe('/apis/authApi/action/content/parent/hierarchy/c1?rootOrg=root&org=org')
    })

    it('builds exercise submission URLs', () => {
      expect(API_END_POINTS.createContentDirectory('c1')).toBe(`${PROTECTED_SLAG_V8}/user/exercise/createContentDirectory/c1`)
      expect(API_END_POINTS.postSubmission('c1')).toBe(`${PROTECTED_SLAG_V8}/user/exercise/postsubmission/c1`)
      expect(API_END_POINTS.uploadFile('c1')).toBe(`${PROTECTED_SLAG_V8}/user/exercise/uploadFileToContentDirectory/c1`)
      expect(API_END_POINTS.get_Submissions('t', 'c1')).toBe(`${PROTECTED_SLAG_V8}/user/exercise/getSubmissions?type=t&contentId=c1`)
    })

    it('builds progress, cohort and analytics URLs', () => {
      expect(API_END_POINTS.MARK_AS_COMPLETE_META('c1')).toBe(`${PROTECTED_SLAG_V8}/user/progress/c1`)
      expect(API_END_POINTS.COHORTS('activeusers' as any, 'c1')).toBe(`${PROTECTED_SLAG_V8}/cohorts/activeusers/c1`)
      expect(API_END_POINTS.COHORTS_GROUP_USER(7)).toBe(`${PROTECTED_SLAG_V8}/cohorts/7`)
      expect(API_END_POINTS.RELATED_RESOURCE('c1', 'Course')).toBe(`${PROTECTED_SLAG_V8}/khub/fetchRelatedResources/c1/Course`)
      expect(API_END_POINTS.POST_ASSESSMENT('c1')).toBe(`${PROTECTED_SLAG_V8}/user/evaluate/post-assessment/c1`)
      expect(API_END_POINTS.CONTENT_ANALYTICS('c1')).toBe(`${PROXY_SLAG_V8}/LA/api/la/contentanalytics?content_id=c1&type=course`)
      expect(API_END_POINTS.DOWNLOAD_CERTIFICATE('cert1')).toBe(`${PROXY_SLAG_V8}/certreg/v2/certs/download/cert1`)
      expect(API_END_POINTS.translateFilters('hi')).toBe(`${PROTECTED_SLAG_V8}/translate/filterdata/hi`)
    })
  })
})

describe('S3_END_POINTS', () => {
  it('builds S3 asset URLs with cache busting', () => {
    const entries = Object.values(S3_END_POINTS)
    expect(entries.length).toBeGreaterThan(0)
    entries.forEach(url => {
      expect(url).toMatch(/^https:\/\/aastar(-app)?-assets\.s3\.ap-south-1\.amazonaws\.com\//)
      expect(url).toMatch(/(cb|v)=\d+/)
    })
  })
})


const PROTECTED_SLAG_V8 = '/apis/protected/v8'
// const PROXY_SLAG_V8 = "/apis/proxies/v8"
// const PUBLIC_SLAG_V8 = "/apis/public/v8"

export const API_END_POINTS = {
  FETCH_USER_GROUPS: (userId: string) =>
    `${PROTECTED_SLAG_V8}/user/group/fetchUserGroup?userId=${userId}`,
  FETCH_USER_ENROLLMENT_LIST: (userId: string | undefined) =>
    // tslint:disable-next-line: max-line-length
    `/apis/proxies/v8/learner/course/v1/user/enrollment/list/${userId}?orgdetails=orgName,email&licenseDetails=name,description,url&fields=contentType,topic,name,channel,mimeType,appIcon,gradeLevel,resourceType,identifier,medium,pkgVersion,thumbnail,board,subject,trackable,posterImage,duration,creatorLogo,license&batchDetails=name,endDate,startDate,status,enrollmentType,createdBy,certificates`,
  SEARCH_V6PUBLIC: '/apis/public/v8/ratingsSearch/getCourses',
  KEYCLOAK_COOKIE: '/apis/public/v8/emailMobile/authv2',
  VALIDATE_CERTIFICATE: '/apis/public/v8/certificate/validate',
  getUserProfile: '/apis/proxies/v8/api/user/v2/read',
  USER_SIGNUP: `/apis/public/v8/register/registerUserWithEmail`,
  USER_SIGNUP_NEW: `/apis/protected/v8/user/profileDetails/createUser`,
  REGISTERUSERWITHMOBILE: `/apis/public/v8/register/registerUserWithMobile`,
  VERIFY_OTP: `/apis/public/v8/register/verifyUserWithMobileNumber`,
  RESET_PASSWORD: `/apis/public/v8/register/resetPassword`,
  SETPASSWORD_OTP: `/apis/public/v8/register/setPasswordWithOTP`,
  ASSIGN_ADMIN_TO_CREATED_DEPARTMENT: '/apis/proxies/v8/user/private/v1/assign/role',
  USER_TNC: "/apis/protected/v8/user/tnc",
  FORM_READ: `/apis/v1/form/read?v=${Date.now()}`,
  PLAYLIST_SEARCH: `/apis/protected/v8/playlist/search?v=${new Date().getTime()}`,
  CONTENT_STATE_READ: `/api/course/v1/content/state/read`,
  PROGRESS_UPDATE: '/apis/public/v8/mobileApp/v2/updateProgress',
  SIGNUP: `/apis/public/v8/emailMobile/signup`,
  REGISTER_USERWITH_MOBILE: `/apis/public/v8/emailMobile/registerUserWithMobile`,
  GENERATE_OTP: `/apis/public/v8/emailMobile/generateOtp`,
  VALIDATE_OTP: `/apis/public/v8/emailMobile/validateOtp`,
  VERIFY_FPW_OTP: `/apis/public/v8/forgot-password/verifyOtp`,
  RESET_FPW_PASSWORD: `/apis/public/v8/forgot-password/reset/proxy/password`,
  SET_FPW_OTP: `/apis/public/v8/forgot-password/verifyOtp`,
  profilePid: '/apis/proxies/v8/api/user/v2/read',
  newssowithMobileEmail: '/apis/public/v8/signupWithAutoLoginV2/register',
  newssowithMobileEmailOrgForm: '/apis/public/v8/signupWithAutoLoginOrgForm/register',
  validateOTP: '/apis/public/v8/signupWithAutoLoginv2/validateOtpWithLogin',
  validateOrgOTP: '/apis/public/v8/signupWithAutoLoginOrgForm/validateOtpWithLogin',
  sendUserOTP: '/apis/public/v8/ssoLogin/otp/sendOtp',
  newLogin: '/apis/public/v8/ssoLogin/login',
  resendOTP: '/apis/public/v8/ssoLogin/otp/resendOtp',
  EMAIL_TEXT: `${PROTECTED_SLAG_V8}/user/email/emailText`, // #POST
  EMAIL_TO_USERID: `${PROTECTED_SLAG_V8}/user/emailToUserId`,
  USER_FOLLOW_DATA: `${PROTECTED_SLAG_V8}/user/follow/fetchAll`, // #GET
  USER_FOLLOW: `${PROTECTED_SLAG_V8}/user/follow`, // #POST
  USER_UNFOLLOW: `${PROTECTED_SLAG_V8}/user/follow/unfollow`, // #POST
  LOGOUT_USER: '/apis/proxies/v8/logout/user',
  webview_login: 'apis/public/v8/mobileApp/webviewLogin',
  AUTH_CONTENT: (path: any) => `/apis/authContent/${path}`
}

export const S3_END_POINTS = {
  ORG_SELECTIVE_COURSE: `https://aastar-assets.s3.ap-south-1.amazonaws.com/data/org-selective-course.json?cb=${Date.now()}`,
  SPHERE_PROFILE_UPDATE_ORG: `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/sphere_profile_update_org.json`,
  EKSHAMATA_ORG_CONFIG: `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/ekshamataOrgConfig.json`,
  QUIZ_CONFIG: `https://aastar-assets.s3.ap-south-1.amazonaws.com/data/quiz-config.json?cb=${Date.now()}`,
  CONTACT_PAGE_CONFIG: `https://aastar-assets.s3.ap-south-1.amazonaws.com/data/contact-page-content.json?v=${Date.now()}`,
  UP_DISTRICT_CONFIG: `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/up_District.json?cb=${Date.now()}`,
  mpANMDistrictUrl: `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/mp_anm_District.json?cb=${Date.now()}`,
  mpCHODistrictUrl: `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/mp_cho_District.json?cb=${Date.now()}`,
  mpTRAINERDistrictUrl: `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/mp_trainer_district.json?cb=${Date.now()}`,
  biharDistrictUrl: `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/bihar-district.json?cb=${Date.now()}`,
  instituteNameUrl: `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/bnrc-institute.json?cb=${Date.now()}`,
  ORG_META_CONFIG: `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/orgMeta.json?cb=${Date.now()}`
}

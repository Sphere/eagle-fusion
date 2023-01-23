import * as _ from 'lodash'
// import { changeformat } from '../../../../project/ws/app/src/public-api'
export const constructReq = (form: any, userProfileData: any) => {
  const userid = userProfileData.userId || userProfileData.id || ''
  const profileReq = {
    id: userid,
    userId: userid,
    personalDetails: {
      firstname: _.get(form, 'firstname') ? form.firstname : userProfileData.personalDetails.firstname,
      middlename: _.get(form, 'middlename') ? form.middlename : userProfileData.personalDetails.middlename,
      surname: _.get(form, 'surname') ? form.surname : userProfileData.personalDetails.surname,
      about: _.get(form, 'about') ? form.about : userProfileData.personalDetails.about,
      photo: _.get(form, 'photo') ? form.photo : userProfileData.personalDetails.photo,
      dob: _.get(form, 'dob') ? form.dob : userProfileData.personalDetails.dob,
      nationality: _.get(form, 'nationality') ? form.nationality : userProfileData.personalDetails.nationality,
      domicileMedium: _.get(form, 'domicileMedium') ? form.domicileMedium : userProfileData.personalDetails.domicileMedium,
      regNurseRegMidwifeNumber: _.get(form, 'regNurseRegMidwifeNumber') ? form.regNurseRegMidwifeNumber :
        userProfileData.personalDetails.regNurseRegMidwifeNumber,
      nationalUniqueId: userProfileData.nationalUniqueId,
      doctorRegNumber: userProfileData.doctorRegNumber,
      instituteName: userProfileData.instituteName,
      nursingCouncil: userProfileData.nursingCouncil,
      gender: _.get(form, 'gender') ? form.gender : userProfileData.personalDetails.gender,
      maritalStatus: _.get(form, 'maritalStatus') ? form.maritalStatus : userProfileData.personalDetails.maritalStatus,
      category: userProfileData.category,
      knownLanguages: _.get(form, 'knownLanguages') ? form.knownLanguages : userProfileData.personalDetails.knownLanguages,
      countryCode: userProfileData.countryCode,
      mobile: _.get(form, 'mobile') ? form.mobile : userProfileData.personalDetails.mobile,
      telephone: userProfileData.personalDetails.telephone,
      primaryEmail: userProfileData.personalDetails.primaryEmail,
      officialEmail: '',
      personalEmail: '',
      postalAddress: _.get(form, 'postalAddress') ? form.postalAddress : userProfileData.personalDetails.postalAddress,
      pincode: _.get(form, 'pincode') ? form.pincode : userProfileData.personalDetails.pincode,
    },
    academics: _.get(form.value, 'courseDegree') ? populateAcademics(form.value, userProfileData) : populateAcademics(userProfileData),
    employmentDetails: {
      service: _.get(userProfileData, 'employmentDetails.service') || '',
      cadre: _.get(userProfileData, 'employmentDetails.cadre') || '',
      allotmentYearOfService: checkvalue(_.get(userProfileData, 'employmentDetails.allotmentYearOfService') || ''),
      dojOfService: getDateFromText(_.get(userProfileData, 'employmentDetails.dojOfService') || ''),
      payType: _.get(userProfileData, 'employmentDetails.payType') || '',
      civilListNo: _.get(userProfileData, 'employmentDetails.civilListNo') || '',
      employeeCode: checkvalue(_.get(userProfileData, 'employmentDetails.employeeCode') || ''),
      officialPostalAddress: checkvalue(_.get(userProfileData, 'employmentDetails.officialPostalAddress') || ''),
      pinCode: checkvalue(_.get(userProfileData, 'employmentDetails.pinCode') || ''),
    },
    professionalDetails: [...getOrganisationsHistory(form, userProfileData)],
    skills: {
      additionalSkills: _.get(userProfileData, 'skills.additionalSkills') || '',
      certificateDetails: _.get(userProfileData, 'skills.certificateDetails') || '',
    },
    interests: {
      professional: _.get(userProfileData, 'interests.professional') || '',
      hobbies: _.get(userProfileData, 'interests.hobbies') || '',
    },
  }
  return { profileReq }
}

export const populateAcademics = (data?: any, userProfileData?: any) => {
  if (data.academics && data.academics.length > 0) {
    const academics: any = []
    if (data.academics && Array.isArray(data.academics)) {
      data.academics.map((item: any) => {
        switch (item.type) {
          case 'X_STANDARD':
            academics.push({
              nameOfQualification: '',
              type: 'X_STANDARD',
              nameOfInstitute: item.nameOfInstitute,
              yearOfPassing: `${item.yearOfPassing
                }`,
            })
            break
          case 'XII_STANDARD':
            academics.push({
              nameOfQualification: '',
              type: 'XII_STANDARD',
              nameOfInstitute: item.nameOfInstitute,
              yearOfPassing: `${item.yearOfPassing
                }`,
            })
            break
          case 'GRADUATE':
            academics.push({
              nameOfQualification: '',
              type: 'GRADUATE',
              nameOfInstitute: item.nameOfInstitute,
              yearOfPassing: `${item.yearOfPassing
                }`,
            })
            break
          case 'POSTGRADUATE':
            academics.push({
              nameOfQualification: '',
              type: 'POSTGRADUATE',
              nameOfInstitute: item.nameOfInstitute,
              yearOfPassing: `${item.yearOfPassing
                }`,
            })
            break
        }
      })
    }
    return academics
  } {
    const academics: any = []
    academics.push(getClass10(data, userProfileData))
    academics.push(getClass12(data, userProfileData))
    academics.push(getDegree(data, userProfileData))
    academics.push(getPostDegree(data, userProfileData))
    return academics
  }
}

export const getClass10 = (data: any, userProfileData?: any) => {
  const class10 = _.find(userProfileData.academics, { type: 'X_STANDARD' })
  return ({
    nameOfQualification: '',
    type: 'X_STANDARD',
    nameOfInstitute: data.courseDegree.type === 'X_STANDARD' ?
      data.institutionName : _.get(class10, 'nameOfInstitute') ? _.get(class10, 'nameOfInstitute') : '',
    yearOfPassing: data.courseDegree.type === 'X_STANDARD' ? `${data.yearPassing
      }` : _.get(class10, 'yearOfPassing') ? _.get(class10, 'yearOfPassing') : '',
  })
}

export const getClass12 = (data: any, userProfileData?: any) => {
  const class12 = _.find(userProfileData.academics, { type: 'XII_STANDARD' })
  return ({
    nameOfQualification: '',
    type: 'XII_STANDARD',
    nameOfInstitute: data.courseDegree.type === 'XII_STANDARD' ? data.institutionName :
      _.get(class12, 'nameOfInstitute') ? _.get(class12, 'nameOfInstitute') : '',
    yearOfPassing: data.courseDegree.type === 'XII_STANDARD' ? `${data.yearPassing
      }` : _.get(class12, 'yearOfPassing') ? _.get(class12, 'yearOfPassing') : '',
  })
}

export const getDegree = (data: any, userProfileData?: any) => {
  const GRADUATE = _.find(userProfileData.academics, { type: 'GRADUATE' })
  return ({
    nameOfQualification: data.courseDegree.type === 'GRADUATE'
      && data.courseName ? data.courseName :
      _.get(GRADUATE, 'nameOfQualification') ?
        _.get(GRADUATE, 'nameOfQualification') : '',
    type: 'GRADUATE',
    nameOfInstitute: data.courseDegree.type === 'GRADUATE' && data.institutionName ?
      data.institutionName : _.get(GRADUATE, 'nameOfInstitute') ? _.get(GRADUATE, 'nameOfInstitute') : '',
    yearOfPassing: data.courseDegree.type === 'GRADUATE' ? `${data.yearPassing
      }` : _.get(GRADUATE, 'yearOfPassing') ? _.get(GRADUATE, 'yearOfPassing') : '',
  })
}

export const getPostDegree = (data: any, userProfileData?: any) => {
  const POSTGRADUATE = _.find(userProfileData.academics, { type: 'POSTGRADUATE' })
  return ({
    nameOfQualification: data.courseDegree.type === 'POSTGRADUATE'
      && data.courseName ? data.courseName : _
        .get(POSTGRADUATE, 'nameOfQualification') ?
      _.get(POSTGRADUATE, 'nameOfQualification') : '',
    type: 'POSTGRADUATE',
    nameOfInstitute: data.courseDegree.type === 'POSTGRADUATE' ? data.institutionName :
      _.get(POSTGRADUATE, 'nameOfInstitute') ? _.get(POSTGRADUATE, 'nameOfInstitute') : '',
    yearOfPassing: data.courseDegree.type === 'POSTGRADUATE' ? `${data.yearPassing
      }` : _.get(POSTGRADUATE, 'yearOfPassing') ? _.get(POSTGRADUATE, 'yearOfPassing') : '',
  })
}

export const getOrganisationsHistory = (form: any, userProfileData: any) => {
  const organisations: any = []
  const org = {
    orgType: _.get(form, 'orgType') ? form.orgType : userProfileData.professionalDetails[0].orgType,
    professionOtherSpecify: _.get(form, 'professionOtherSpecify') ? form.professionOtherSpecify :
      userProfileData.professionalDetails[0].professionOtherSpecify,
    orgOtherSpecify: _.get(form, 'orgOtherSpecify') ? form.orgOtherSpecify :
      userProfileData.professionalDetails[0].orgOtherSpecify,
    name: _.get(form, 'organizationName', _.get(userProfileData, 'professionalDetails[0].name', '')),
    nameOther: form.orgNameOther,
    industry: form.industry,
    industryOther: form.industryOther,
    designation: _.get(form, 'designation') ? form.designation : userProfileData.professionalDetails[0].designation,
    profession: _.get(form, 'profession') ? form.profession : userProfileData.professionalDetails[0].profession,
    location: _.get(form, 'location') ? form.location : userProfileData.professionalDetails[0].location,
    responsibilities: '',
    doj: _.get(form, 'doj') ? form.doj : userProfileData.professionalDetails[0].doj,
    description: form.orgDesc,
    completePostalAddress: '',
    additionalAttributes: {},
    osid: _.get(userProfileData, 'professionalDetails[0].osid') || undefined,
  }
  organisations.push(org)
  return organisations
}

export const checkvalue = (value: any) => {
  if (value && value === 'undefined') {
    // tslint:disable-next-line:no-parameter-reassignment
    value = ''
  } else {
    return value
  }
}
export const getDateFromText = (dateString: string): any => {
  if (dateString) {
    const splitValues: string[] = dateString.split('-')
    const [dd, mm, yyyy] = splitValues
    const dateToBeConverted = `${yyyy}-${mm}-${dd}`
    return new Date(dateToBeConverted)
  }
  return ''
}

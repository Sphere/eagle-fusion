import * as _ from 'lodash'
import { changeformat } from '../../../../project/ws/app/src/public-api'
export const constructReq = (form: any, userProfileData: any) => {
  const userid = userProfileData.userId || userProfileData.id || ''
  const profileReq = {
    id: userid,
    userId: userid,
    personalDetails: {
      firstname: form.value.firstname !== 'undefined' ? form.value.firstname : userProfileData.personalDetails.firstname,
      middlename: form.value.middlename !== 'undefined' ? form.value.middlename : userProfileData.personalDetails.middlename,
      surname: form.value.surname !== 'undefined' ? form.value.surname : userProfileData.personalDetails.surname,
      about: form.value.about !== 'undefined' ? form.value.about : userProfileData.personalDetails.about,
      dob: form.value.dob !== 'undefined' ? form.value.dob : userProfileData.personalDetails.dob,
      nationality: form.value.nationality !== 'undefined' ? form.value.nationality : userProfileData.personalDetails.countryCode,
      domicileMedium: form.value.motherTounge !== 'undefined' ? form.value.motherTounge : userProfileData.domicileMedium,
      regNurseRegMidwifeNumber: form.value.rnNumber !== 'undefined' ? form.value.rnNumber : userProfileData.regNurseRegMidwifeNumber,
      nationalUniqueId: userProfileData.nationalUniqueId,
      doctorRegNumber: userProfileData.doctorRegNumber,
      instituteName: userProfileData.instituteName,
      nursingCouncil: userProfileData.nursingCouncil,
      gender: form.value.gender !== 'undefined' ? form.value.gender : userProfileData.gender,
      maritalStatus: form.value.maritalStatus !== 'undefined' ? form.value.maritalStatus : userProfileData.maritalStatus,
      category: userProfileData.category,
      knownLanguages: form.value.languages !== 'undefined' ? form.value.languages : userProfileData.knownLanguages,
      countryCode: userProfileData.countryCode,
      mobile: form.value.phoneNumber !== 'undefined' ? form.value.phoneNumber : userProfileData.mobile,
      telephone: userProfileData.telephone,
      primaryEmail: userProfileData.primaryEmail,
      officialEmail: '',
      personalEmail: '',
      postalAddress: form.value.address !== 'undefined' ? form.value.address : userProfileData.residenceAddress,
      pincode: form.value.pincode !== 'undefined' ? form.value.pincode : userProfileData.pincode,
    },
    academics: populateAcademics(userProfileData),
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

export const populateAcademics = (data: any) => {
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
}

export const getOrganisationsHistory = (form: any, userProfileData: any) => {
  const organisations: any = []
  const org = {
    organisationType: '',
    name: form.value.organizationName,
    nameOther: form.value.orgNameOther,
    industry: form.value.industry,
    industryOther: form.value.industryOther,
    designation: form.value.designation,
    designationOther: userProfileData.professionalDetails[0].designationOther,
    location: form.value.location,
    responsibilities: '',
    doj: changeformat(new Date(`${form.value.doj}`)),
    description: form.value.orgDesc,
    completePostalAddress: '',
    additionalAttributes: {},
    osid: _.get(userProfileData, 'professionalDetails[0].osid') || undefined,
  }
  if (userProfileData.professionalDetails[0].organisationType) {
    org.organisationType = userProfileData.professionalDetails[0].organisationType
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
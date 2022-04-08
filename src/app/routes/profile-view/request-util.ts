import * as _ from 'lodash'
import { changeformat } from '../../../../project/ws/app/src/public-api'
export const constructReq = (form: any, userProfileData: any) => {
  const userid = userProfileData.userId || userProfileData.id || ''
  console.log(form.value.firstname)

  const profileReq = {
    id: userid,
    userId: userid,
    personalDetails: {
      firstname: _.get(form.value, 'firstname') ? form.value.firstname : userProfileData.personalDetails.firstname,
      middlename: _.get(form.value, 'middlename') ? form.value.middlename : userProfileData.personalDetails.middlename,
      surname: _.get(form.value, 'surname') ? form.value.surname : userProfileData.personalDetails.surname,
      about: _.get(form.value, 'about') ? form.value.about : userProfileData.personalDetails.about,
      dob: _.get(form.value, 'dob') ? form.value.dob : userProfileData.personalDetails.dob,
      nationality: _.get(form.value, 'nationality') ? form.value.nationality : userProfileData.personalDetails.countryCode,
      domicileMedium: _.get(form.value, 'domicileMedium') ? form.value.motherTounge : userProfileData.domicileMedium,
      regNurseRegMidwifeNumber: _.get(form.value, 'rnNumber') ? form.value.rnNumber : userProfileData.personalDetails.regNurseRegMidwifeNumber,
      nationalUniqueId: userProfileData.nationalUniqueId,
      doctorRegNumber: userProfileData.doctorRegNumber,
      instituteName: userProfileData.instituteName,
      nursingCouncil: userProfileData.nursingCouncil,
      gender: _.get(form.value, 'gender') ? form.value.gender : userProfileData.personalDetails.gender,
      maritalStatus: _.get(form.value, 'maritalStatus') ? form.value.maritalStatus : userProfileData.personalDetails.maritalStatus,
      category: userProfileData.category,
      knownLanguages: _.get(form.value, 'languages') ? form.value.languages : userProfileData.personalDetails.knownLanguages,
      countryCode: userProfileData.countryCode,
      mobile: _.get(form.value, 'phoneNumber') ? form.value.phoneNumber : userProfileData.personalDetails.mobile,
      telephone: userProfileData.personalDetails.telephone,
      primaryEmail: userProfileData.personalDetails.primaryEmail,
      officialEmail: '',
      personalEmail: '',
      postalAddress: _.get(form.value, 'address') ? form.value.address : userProfileData.personalDetails.residenceAddress,
      pincode: _.get(form.value, 'pincode') ? form.value.pincode : userProfileData.personalDetails.pincode,
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
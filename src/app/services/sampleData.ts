export const data = {
  "orgData": {
    "defaultLang": "hi",
    "foundationLogo": "/fusion-assets/images/sphere-new-logo.svg",
    "source": "",
    "role": ""
  },
  "LAYOUT_HEADER": {
    "appLogo": "",
    "isRequired": true,
    "searchMenu": {
      "id": "web_search",
      "type": "search",
      "icon": "",
      "placeholder": "What do you want to learn today?"
    },
    "webMenuItems": [
      "homeTab",
      "courseTab",
      "competencyTab",
      "accountTab",
      "notifTab"
    ],
    "mobileMenuItems": [
      "homeTab",
      "courseTab",
      "competencyTab",
      "searchMob",
      "notifTab"
    ],
    "menuItems": [
      {
        "id": "homeTab",
        "title": "Home",
        "redirect": "page/home",
        "active": true,
        "show": true,
        "type": "text",
        "image": {
          "isMobile": true,
          "src": "/fusion-assets/icons/Home.svg"
        }
      },
      {
        "id": "courseTab",
        "title": "My Courses",
        "redirect": "app/user/my_courses",
        "active": false,
        "show": false,
        "type": "text",
        "image": {
          "isMobile": true,
          "src": "/fusion-assets/icons/material-symbols.svg"
        }
      },
      {
        "id": "competencyTab",
        "title": "Competency",
        "redirect": "app/user/competency",
        "active": false,
        "show": false,
        "type": "text",
        "image": {
          "isMobile": true,
          "src": "/fusion-assets/icons/Competency_home.svg"
        }
      },
      {
        "id": "searchMob",
        "title": "Search",
        "redirect": "app/user/search",
        "active": false,
        "show": false,
        "type": "text",
        "image": {
          "isMobile": true,
          "src": "/fusion-assets/icons/Search.svg"
        }
      },
      {
        "id": "accountTab",
        "title": "Account",
        "redirect": "app/profile-view",
        "active": false,
        "show": false,
        "type": "text",
        "image": {
          "isMobile": false,
          "src": "/fusion-assets/icons/account.svg"
        }
      },
      {
        "id": "notifTab",
        "title": "Notification",
        "redirect": "notification",
        "active": false,
        "show": false,
        "type": "button-icon",
        "image": {
          "src": "/fusion-assets/icons/notifications.svg"
        }
      }
    ],
    "rightMenuItem": {
      "id": "menu",
      "title": "",
      "image": {
        "isMobile": true,
        "src": "/fusion-assets/icons/Hamburger_menu-svg.svg"
      }
    }
  },
  "LAYOUT_BODY": {
    "heading": "",
    "subHeading": "",
    "dataCorasoul": {},
    "sections": {
      "homeTab": [
        {
          "title": "Welcome !",
          "subTitle": "Start Learning",
          "show": true,
          "data": [
            {
              "title": "Check out courses with CNE Hours",
              "titleHi": "सीएनई आवर्स के साथ पाठ्यक्रम देखें",
              "img": "/fusion-assets/images/banner_1_cne.png",
              "scrollEmit": "scrollToCneCourses",
              "bg-color": "#D7AC5C;"
            },
            {
              "title": "Watch tutorials on how sphere works",
              "titleHi": "जानिए स्फीयर कैसे काम करता है",
              "img": "/fusion-assets/images/banner_2.png",
              "scrollEmit": "scrollToHowSphereWorks",
              "bg-color": "#469788;;"
            }
          ]
        },
        {
          "title": "CONTINUE LEARNING",
          "headerClass": "header1 header0",
          "playlistConfigId": "CONTINUE_LEARNING",
          "subTitle": "",
          "show": true,
          "data": {},
          "limit": 5,
          "displayConfigWeb": {
            "displayType": "card-mini",
            "badges": {
              "certification": true,
              "rating": true,
              "completionPercentage": true
            }
          },
          "displayConfig": {
            "displayType": "card-mini",
            "badges": {
              "certification": true,
              "rating": true,
              "completionPercentage": true,
              "mobilesourceName": true
            }
          },
          "button": {
            "label1": "View All",
            "label2": "Hide",
            "img": "/fusion-assets/icons/Arrowpng.png",
            "courseType": "continueLearning",
            "routingUrl": "app/user/my_courses"
          }
        },
        {
          "title": "FOR YOU",
          "headerClass": "header1",
          "playlistConfigId": "YOUR_PLANS_PLAYLIST",
          "subTitle": "",
          "show": true,
          "data": {},
          "limit": 5,
          "displayConfigWeb": {
            "displayType": "card-badges",
            "badges": {
              "certification": true,
              "rating": true,
              "sourceName": true
            }
          },
          "displayConfig": {
            "displayType": "card-badges",
            "badges": {
              "certification": true,
              "rating": true,
              "sourceName": true
            }
          },
          "button": {
            "label1": "View All",
            "label2": "Hide",
            "img": "/fusion-assets/icons/Arrowpng.png",
            "courseType": "formatForYouCourses",
            "routingUrl": "app/user/my_courses"
          }
        },
        {
          "title": "TOP COURSES",
          "headerClass": "header1",
          "playlistConfigId": "TOP_COURSE_PLAYLIST",
          "subTitle": "",
          "show": true,
          "data": {},
          "limit": 5,
          "displayConfigWeb": {
            "displayType": "card-badges",
            "badges": {
              "certification": true,
              "rating": true,
              "sourceName": true
            }
          },
          "displayConfig": {
            "displayType": "card-badges",
            "badges": {
              "certification": true,
              "rating": true,
              "sourceName": true
            }
          },
          "button": {
            "label1": "View All",
            "label2": "Hide",
            "img": "/fusion-assets/icons/Arrowpng.png",
            "courseType": "topCourse",
            "routingUrl": "app/search/topCourse"
          }
        },
        {
          "title": "CNE COURSES",
          "headerClass": "header1",
          "playlistConfigId": "CNE_COURSE_PLAYLIST",
          "subTitle": "",
          "show": true,
          "data": {},
          "limit": 5,
          "displayConfigWeb": {
            "displayType": "card-badges",
            "badges": {
              "cneName": true,
              "rating": true,
              "sourceName": true
            }
          },
          "displayConfig": {
            "displayType": "card-badges",
            "badges": {
              "cneName": true,
              "rating": true,
              "sourceName": true
            }
          },
          "button": {
            "label1": "View All",
            "label2": "Hide",
            "img": "/fusion-assets/icons/Arrowpng.png",
            "courseType": "cneCourses",
            "routingUrl": "app/search/topCourse"
          }
        },
        {
          "title": "How sphere works",
          "subTitle": "In 3-simple videos we guide you through making an account and getting certified.",
          "subTitleMobile": "3 simple steps",
          "data": [
            {
              "url": "https://www.youtube.com/embed/1fqlys8mkHg",
              "title": "Register for a course",
              "description": "Explore various courses and pick the ones you like"
            },
            {
              "url": "https://www.youtube.com/embed/Kl28R7m2k50",
              "title": "Take the course",
              "description": "Access the course anytime, at your convinience"
            },
            {
              "url": "https://www.youtube.com/embed/JTGzCkEXlmU",
              "title": "Get certified",
              "description": "Receive downloadable and shareable certificates"
            }
          ]
        }
      ],
      "courseTab": {
        "title": "My Courses",
        "tabMenu": [
          {
            "id": 0,
            "label": "Started",
            "data": [],
            "className": "resource-container",
            "displayConfigWeb": {
              "displayType": "card-mini",
              "badges": {
                "certification": true,
                "rating": true,
                "completionPercentage": true,
                "resume": true
              }
            },
            "displayConfig": {
              "displayType": "card-mini",
              "badges": {
                "certification": true,
                "rating": true,
                "completionPercentage": true,
                "mobilesourceName": true
              }
            },
            "fallbackState": {
              "label": "You have not started any courses.",
              "button": {
                "show": true,
                "label": "Check out courses for you"
              }
            }
          },
          {
            "id": 1,
            "label": "For You",
            "data": [],
            "className": "responsiveDiv",
            "displayConfigWeb": {
              "displayType": "card-badges",
              "badges": {
                "certification": true,
                "sourceName": true,
                "rating": true
              }
            },
            "displayConfig": {
              "displayType": "card-badges",
              "badges": {
                "certification": true,
                "sourceName": true,
                "rating": true
              }
            },
            "fallbackState": {
              "label": "You have no courses.",
              "button": {
                "show": false,
                "label": ""
              }
            }
          },
          {
            "id": 2,
            "label": "Completed",
            "data": [],
            "className": "resource-container",
            "displayConfigWeb": {
              "displayType": "card-mini",
              "badges": {
                "rating": true,
                "viewAll": true,
                "mobilesourceName": true,
                "sourceLine": true
              }
            },
            "displayConfig": {
              "displayType": "card-mini",
              "badges": {
                "rating": true,
                "mobilesourceName": true,
                "sourceLine": true
              }
            },
            "fallbackState": {
              "label": "You have not completed any courses.",
              "button": {
                "show": false,
                "label": ""
              }
            }
          }
        ]
      },
      "competencyTab": [],
      "searchMob": [],
      "accountTab": {
        "webOrderList": [
          "profileImg",
          "personalDetails",
          "orgDetails",
          "academicDetails",
          "langPreference",
          "certificate",
          "help&Support",
          "logout"
        ],
        "mobOrderList": [
          "profileImg",
          "help&Support",
          "langPreference",
          "certificate",
          "personalDetails",
          "orgDetails",
          "academicDetails",
          "logout"
        ],
        "menuItems": [
          {
            "id": "profileImg",
            "text": "Position",
            "img": "/fusion-assets/icons/prof1.png",
            "type": "heading",
            "editIcon": {
              "label": "edit",
              "className": "pencil"
            }
          },
          {
            "id": "help&Support",
            "isRequired": true,
            "text": "Help and Support",
            "type": "button",
            "img": "/fusion-assets/icons/support-agent.svg",
            "phone": "tel:+918429036003",
            "icon": "",
            "data": {}
          },
          {
            "id": "logout",
            "isRequired": true,
            "text": "Logout",
            "type": "button",
            "img": "",
            "icon": "",
            "data": {
              "mobInfoText": "To request account deletion please send an email to",
              "supportLink": "support@aastrika.org"
            }
          },
          {
            "id": "langPreference",
            "isRequired": true,
            "name": "language",
            "text": "Language Preference",
            "type": "text",
            "img": "/fusion-assets/images/uil.svg",
            "icon": "/fusion-assets/icons/arrow-right.svg",
            "selected": false,
            "data": {
              "title": "Language Preference",
              "sub_header": "APP_LANGUAGE",
              "img": {
                "show": false,
                "icon": ""
              },
              "optionsList": [
                {
                  "code": "en",
                  "name": "English",
                  "checked": false
                },
                {
                  "code": "hi",
                  "name": "हिंदी",
                  "checked": false
                }
              ],
              "button": {
                "label": "Save"
              }
            }
          },
          {
            "id": "certificate",
            "isRequired": true,
            "name": "certificates",
            "text": "My Certificates",
            "type": "text",
            "img": "/fusion-assets/images/Group.svg",
            "icon": "/fusion-assets/icons/arrow-right.svg",
            "data": {},
            "selected": false
          },
          {
            "id": "personalDetails",
            "isRequired": true,
            "name": "personal",
            "text": "Personal Details",
            "type": "text",
            "img": "/fusion-assets/images/manage_accounts.svg",
            "icon": "/fusion-assets/icons/arrow-right.svg",
            "selected": false,
            "data": {
              "title": "Personal Details",
              "sub_header": "",
              "img": {
                "show": false,
                "icon": ""
              },
              "optionsList": [
                {
                  "title": "First name",
                  "name": "firstname",
                  "required": true
                },
                {
                  "title": "Last name",
                  "name": "surname",
                  "required": true
                },
                {
                  "title": "DOB",
                  "name": "dob",
                  "required": false
                },
                {
                  "title": "POSITION",
                  "name": "profession",
                  "required": true
                },
                {
                  "title": "ORG_NAME",
                  "name": "name",
                  "required": true
                },
                {
                  "title": "NATIONALITY",
                  "name": "nationality",
                  "required": true
                },
                {
                  "title": "MOTHER_TONGUE",
                  "name": "domicileMedium",
                  "required": true
                },
                {
                  "title": "GENDER",
                  "name": "gender",
                  "required": true
                },
                {
                  "title": "MARITAL_STATUS",
                  "name": "maritalStatus",
                  "required": true
                },
                {
                  "title": "PHONE_NUMBER",
                  "name": "mobile",
                  "required": true
                },
                {
                  "title": "COUNTRY",
                  "name": "country",
                  "required": true
                },
                {
                  "title": "STATE",
                  "name": "state",
                  "required": true
                },
                {
                  "title": "CITY_DISTRICT",
                  "name": "distict",
                  "required": true
                },
                {
                  "title": "PINCODE",
                  "name": "pincode",
                  "required": true
                },
                {
                  "title": "FRMELEMNTS_LBL_BLOCK",
                  "name": "block",
                  "required": true
                }
              ],
              "formData": [
                {
                  "key": "firstname",
                  "type": "text",
                  "label": "First name",
                  "required": true
                },
                {
                  "key": "surname",
                  "type": "text",
                  "label": "Last name",
                  "required": true
                },
                {
                  "key": "mobile",
                  "type": "text",
                  "label": "Phone Number",
                  "required": false,
                  "pattern": "^[0-9]*$"
                },
                {
                  "key": "email",
                  "type": "text",
                  "label": "Email ID",
                  "required": false,
                  "pattern": "^[0-9]*$"
                },
                {
                  "key": "dob",
                  "type": "dob",
                  "label": "Date Of Birth",
                  "required": true,
                  "errMsg": "You must be at least 18 years old"
                },
                {
                  "key": "country",
                  "type": "select",
                  "label": "Country",
                  "options": "countries",
                  "required": false
                },
                {
                  "key": "state",
                  "type": "select",
                  "label": "State",
                  "options": "states",
                  "required": false
                },
                {
                  "key": "distict",
                  "type": "select",
                  "label": "District",
                  "options": "disticts",
                  "required": false
                },
                {
                  "key": "block",
                  "type": "text",
                  "label": "Block",
                  "required": false
                },
                {
                  "key": "pincode",
                  "type": "text",
                  "label": "Pincode",
                  "required": false,
                  "pattern": "^[0-9]*$"
                },
                {
                  "key": "personal-btn",
                  "type": "button",
                  "label": "Save",
                  "required": false
                }
              ],
              "sucessMsg": "User profile details updated successfully!"
            }
          },
          {
            "id": "orgDetails",
            "isRequired": true,
            "name": "organization",
            "text": "Organization Details",
            "type": "text",
            "img": "/fusion-assets/images/corporate.svg",
            "icon": "/fusion-assets/icons/arrow-right.svg",
            "selected": false,
            "data": {
              "title": "Organizational Details",
              "sub_header": "",
              "img": {
                "show": false,
                "icon": "assets/icons/edit-icon-outline.svg"
              },
              "optionsList": [
                {
                  "title": "BACKGROUND",
                  "name": "background",
                  "required": false
                },
                {
                  "title": "POSITION",
                  "name": "designation",
                  "required": true
                },
                {
                  "title": "DEPARTMENT_NAME",
                  "name": "channel",
                  "required": true
                },
                {
                  "title": "FACILITY_NAME",
                  "name": "facilityName",
                  "required": true
                },
                {
                  "title": "FACILITY_CODE",
                  "name": "facilityCode",
                  "required": true
                },
                {
                  "title": "FACILITY_TYPE",
                  "name": "facilityType",
                  "required": true
                },
                {
                  "title": "PROFESSIONS",
                  "name": "profession",
                  "required": false
                },
                {
                  "title": "ORGANIZATIONAL_TYPE",
                  "name": "orgType",
                  "required": true
                },
                {
                  "title": "ORGANIZATIONAL_NAME",
                  "name": "name",
                  "required": true
                },
                {
                  "title": "RN_NUM",
                  "name": "rnNumber",
                  "required": true
                },
                {
                  "title": "QUALIFICATION",
                  "name": "qualification",
                  "required": true
                },
                {
                  "title": "INSTITUE_NAME",
                  "name": "instituteName",
                  "required": true
                },
                {
                  "title": "CITY_DISTRICT",
                  "name": "locationselect",
                  "required": true
                },
                {
                  "title": "FRMELEMNTS_LBL_BLOCK",
                  "name": "block",
                  "required": false
                },
                {
                  "title": "SUB_CENTRE",
                  "name": "subcentre",
                  "required": true
                }
              ],
              "formData": [
                {
                  "key": "profession",
                  "type": "mat-select",
                  "label": "Background",
                  "placeholder": "Profession",
                  "required": false,
                  "disabled": false,
                  "options": "professions"
                },
                {
                  "key": "designation",
                  "type": "select",
                  "label": "",
                  "placeholder": "Designation *",
                  "required": true,
                  "disabled": true,
                  "options": "professionalOptions",
                  "showIf": {
                    "profession": [
                      "Healthcare Worker",
                      "Healthcare Volunteer",
                      "Student",
                      "Faculty"
                    ]
                  },
                  "pattern": "^[a-zA-Z][^\\s].*$",
                  "errorMsg": "errorMsg"
                },
                {
                  "key": "professionOtherSpecify",
                  "type": "text",
                  "label": "",
                  "placeholder": "Please Specify *",
                  "required": true,
                  "disabled": false,
                  "showIf": {
                    "profession": [
                      "Healthcare Worker",
                      "Healthcare Volunteer"
                    ],
                    "designation": [
                      "Others"
                    ]
                  },
                  "pattern": "^[a-zA-Z][^\\s].*$",
                  "errorMsg": "errorMsg"
                },
                {
                  "key": "regNurseRegMidwifeNumber",
                  "type": "text",
                  "label": "RN/RM Number",
                  "placeholder": "RN/RM Number",
                  "required": false,
                  "disabled": false,
                  "showIf": {
                    "profession": [
                      "Healthcare Worker"
                    ]
                  },
                  "pattern": "^[a-zA-Z][^\\s].*$",
                  "errorMsg": ""
                },
                {
                  "key": "selectBackground",
                  "type": "select",
                  "label": "",
                  "placeholder": "Select Background",
                  "required": false,
                  "disabled": true,
                  "options": "professionalOptions",
                  "showIf": {
                    "profession": [
                      "Others"
                    ]
                  }
                },
                {
                  "key": "designation",
                  "type": "text",
                  "label": "",
                  "placeholder": "Designation",
                  "required": false,
                  "disabled": false,
                  "showIf": {
                    "profession": [
                      "Others"
                    ],
                    "selectBackground": [
                      "Other"
                    ]
                  },
                  "pattern": ""
                },
                {
                  "key": "nameOther",
                  "type": "text",
                  "label": "",
                  "placeholder": "Please Specify Profession *",
                  "required": true,
                  "disabled": false,
                  "showIf": {
                    "profession": [
                      "Others"
                    ],
                    "selectBackground": [
                      "Other"
                    ]
                  },
                  "pattern": "^[a-zA-Z][^\\s].*$",
                  "errorMsg": "errorMsg"
                },
                {
                  "key": "orgType",
                  "type": "select",
                  "label": "",
                  "placeholder": "Organization Type *",
                  "required": true,
                  "disabled": true,
                  "options": "orgTypes",
                  "showIf": {
                    "profession": [
                      "Healthcare Worker",
                      "Healthcare Volunteer",
                      "Others"
                    ],
                    "selectBackground": [
                      "Other"
                    ]
                  }
                },
                {
                  "key": "orgOtherSpecify",
                  "type": "text",
                  "label": "",
                  "placeholder": "Please Specify *",
                  "required": true,
                  "disabled": false,
                  "showIf": {
                    "profession": [
                      "Healthcare Worker",
                      "Healthcare Volunteer",
                      "Others"
                    ],
                    "selectBackground": [
                      "Other"
                    ],
                    "orgType": [
                      "Others"
                    ]
                  },
                  "pattern": "^[a-zA-Z][^\\s].*$",
                  "errorMsg": "errorMsg"
                },
                {
                  "key": "orgName",
                  "type": "text",
                  "label": "",
                  "placeholder": "Organization Name",
                  "required": false,
                  "disabled": false,
                  "showIf": {
                    "profession": [
                      "Healthcare Worker",
                      "Healthcare Volunteer",
                      "Others"
                    ],
                    "selectBackground": [
                      "Other"
                    ]
                  },
                  "pattern": "^[a-zA-Z][^\\s].*$",
                  "errorMsg": "errorMsg"
                },
                {
                  "key": "courseName",
                  "type": "text",
                  "label": "",
                  "placeholder": "Qualification",
                  "required": false,
                  "disabled": false,
                  "showIf": {
                    "profession": [
                      "Student"
                    ]
                  },
                  "pattern": "^[a-zA-Z][^\\s].*$",
                  "errorMsg": "errorMsg"
                },
                {
                  "key": "instituteName",
                  "type": "text",
                  "label": "",
                  "placeholder": "Institution Name *",
                  "required": true,
                  "disabled": false,
                  "showIf": {
                    "profession": [
                      "Student"
                    ]
                  },
                  "pattern": "^[a-zA-Z][^\\s].*$",
                  "errorMsg": "errorMsg"
                },
                {
                  "key": "orgName",
                  "type": "text",
                  "label": "",
                  "placeholder": "Institution Name *",
                  "required": true,
                  "disabled": false,
                  "showIf": {
                    "profession": [
                      "Faculty"
                    ]
                  },
                  "pattern": "^[a-zA-Z][^\\s].*$",
                  "errorMsg": "errorMsg"
                },
                {
                  "key": "locationselect",
                  "type": "select",
                  "label": "",
                  "placeholder": "City/District",
                  "required": true,
                  "disabled": true,
                  "options": "disticts",
                  "showIf": {
                    "profession": [
                      "ASHA",
                      "Others"
                    ],
                    "selectBackground": [
                      "Asha Facilitator",
                      "Asha Trainer"
                    ]
                  }
                },
                {
                  "key": "block",
                  "type": "text",
                  "label": "",
                  "placeholder": "Block",
                  "required": false,
                  "disabled": false,
                  "showIf": {
                    "profession": [
                      "ASHA",
                      "Others"
                    ],
                    "selectBackground": [
                      "Asha Facilitator",
                      "Asha Trainer"
                    ]
                  }
                },
                {
                  "key": "subcentre",
                  "type": "text",
                  "label": "",
                  "placeholder": "Sub Centre",
                  "required": false,
                  "disabled": false,
                  "showIf": {
                    "profession": [
                      "ASHA",
                      "Others"
                    ],
                    "selectBackground": [
                      "Asha Facilitator",
                      "Asha Trainer"
                    ]
                  }
                },
                {
                  "key": "organization-btn",
                  "type": "submit",
                  "label": "Save",
                  "required": false,
                  "condition": "isEditableForSphere"
                }
              ],
              "sucessMsg": "User profile details updated successfully!"
            }
          },
          {
            "id": "academicDetails",
            "isRequired": true,
            "name": "academic",
            "text": "Academic Details",
            "type": "text",
            "img": "/fusion-assets/images/school.svg",
            "icon": "/fusion-assets/icons/arrow-right.svg",
            "selected": false,
            "data": {
              "title": "Education",
              "sub_header": "+ Add Education",
              "button": {
                "show": true,
                "label": "edit",
                "icon": "pencil"
              },
              // "optionsList": [
              //   {
              //     "title": "BACKGROUND",
              //     "name": "background",
              //     "required": false
              //   },
              //   {
              //     "title": "PROFESSIONS",
              //     "name": "profession",
              //     "required": false
              //   },
              //   {
              //     "title": "ORGANIZATIONAL_TYPE",
              //     "name": "orgType",
              //     "required": false
              //   },
              //   {
              //     "title": "ORGANIZATIONAL_NAME",
              //     "name": "name",
              //     "required": false
              //   },
              //   {
              //     "title": "RN_NUM",
              //     "name": "rnNumber",
              //     "required": true
              //   },
              //   {
              //     "title": "QUALIFICATION",
              //     "name": "qualification",
              //     "required": false
              //   },
              //   {
              //     "title": "INSTITUE_NAME",
              //     "name": "instituteName",
              //     "required": true
              //   },
              //   {
              //     "title": "CITY_DISTRICT",
              //     "name": "locationselect",
              //     "required": false
              //   },
              //   {
              //     "title": "FRMELEMNTS_LBL_BLOCK",
              //     "name": "block",
              //     "required": false
              //   },
              //   {
              //     "title": "SUB_CENTRE",
              //     "name": "subcentre",
              //     "required": false
              //   }
              // ]
            }
          }
        ]
      },
      "notifTab": []
    }
  },
  "LAYOUT_FOOTER": {
    "footerLabel": "2024 AastarUrmika Health Systems ('Aastrika Foundation')",
    "menuItems": [
      {
        "heading": "Quick Links",
        "link": "",
        "href": "",
        "links": [
          {
            "label": "Privacy policy",
            "type": "dp",
            "routerLink": "/public/tnc"
          },
          {
            "label": "Terms of Use",
            "type": "tnc",
            "routerLink": "/public/tnc"
          }
        ]
      },
      {
        "heading": "Help & Contact",
        "link": "support@aastrika.org",
        "href": "http://support.aastrika.org/support/solutions",
        "links": []
      },
      {
        "label": "Talk to us on WhatsApp",
        "src": "/fusion-assets/icons/whatsapp.png",
        "href": "https://wa.me/919632013414?text=Hi"
      },
      {
        "heading": "Additional Links",
        "label": "Aastrika Foundation",
        "href": "https://www.aastrika.org/",
        "socialLinks": [
          {
            "href": "https://twitter.com/aastrika_fndn?s=21&t=I9xN5rzMahavP0R1Fp7VwA",
            "icon": "/fusion-assets/icons/icons8-twitter.svg",
            "alt": "twitter"
          },
          {
            "href": "https://www.facebook.com/aastrikasphere?mibextid=LQQJ4d",
            "icon": "/fusion-assets/icons/icons8-facebook.svg",
            "alt": "facebook"
          },
          {
            "href": "https://instagram.com/sphere.aastrika?igshid=MmJiY2I4NDBkZg==",
            "icon": "/fusion-assets/icons/icons8-instagram.svg",
            "alt": "instagram"
          },
          {
            "href": "https://www.linkedin.com/company/aastrika-foundation/",
            "icon": "/fusion-assets/icons/icons8-linkedin.svg",
            "alt": "linkedin"
          }
        ]
      }
    ]
  }
}
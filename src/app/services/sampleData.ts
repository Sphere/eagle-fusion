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
        "active": true,
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
        "active": true,
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
        "active": true,
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
        "active": true,
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
        "src": "/fusion-assets/icon/menu-item.svg"
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
          "displayConfig": {
            "displayType": "card-mini",
            "badges": {
              "certification": true,
              "rating": true,
              "completionPercentage": true
            }
          },
          "button": {
            "label": "View All",
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
          "displayConfig": {
            "displayType": "card-badges",
            "badges": {
              "certification": true,
              "rating": true,
              "sourceName": true
            }
          },
          "button": {
            "label": "View All",
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
          "displayConfig": {
            "displayType": "card-badges",
            "badges": {
              "certification": true,
              "rating": true,
              "sourceName": true
            }
          },
          "button": {
            "label": "View All",
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
          "displayConfig": {
            "displayType": "card-badges",
            "badges": {
              "cneName": true,
              "rating": true,
              "sourceName": true
            }
          },
          "button": {
            "label": "View All",
            "img": "/fusion-assets/icons/Arrowpng.png",
            "courseType": "",
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
      "courseTab": [
        {
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
        }
      ],
      "competencyTab": [],
      "searchMob": [],
      "accountTab": [],
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
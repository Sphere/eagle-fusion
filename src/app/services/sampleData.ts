export const data = {
  "orgData": {
    "defaultLang": "hi",
    "foundationLogo": "/fusion-assets/images/sphere-new-logo.svg",
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
    "webMenuItems": ["homeTab", "CourseTab", "CompetencyTab", "AccountTab", "NotifTab"],
    "mobileMenuItems": ["homeTab", "CourseTab", "CompetencyTab", "searchMob", "NotifTab"],
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
          "src": "/fusion-assets/icons/Home.svg",
        }
      },
      {
        "id": "CourseTab",
        "title": "My Courses",
        "redirect": "app/user/my_courses",
        "active": true,
        "show": false,
        "type": "text",
        "image": {
          "isMobile": true,
          "src": "/fusion-assets/icons/material-symbols.svg",
        }
      },
      {
        "id": "CompetencyTab",
        "title": "Competency",
        "redirect": "app/user/competency",
        "active": true,
        "show": false,
        "type": "text",
        "image": {
          "isMobile": true,
          "src": "/fusion-assets/icons/Competency_home.svg",
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
          "src": "/fusion-assets/icons/Search.svg",
        }
      },
      {
        "id": "AccountTab",
        "title": "Account",
        "redirect": "app/profile-view",
        "active": true,
        "show": false,
        "type": "text",
        "image": {
          "isMobile": false,
          "src": "/fusion-assets/icons/account.svg",
        }
      },
      {
        "id": "NotifTab",
        "title": "Notification",
        "redirect": "notification",
        "active": false,
        "show": false,
        "type": "button-icon",
        "image": {
          "src": "/fusion-assets/icons/notifications.svg",
        }
      },
    ],
    "rightMenuItem": {
      "id": "menu",
      "title": "",
      "image": {
        "isMobile": true,
        "src": "/fusion-assets/icon/menu-item.svg",
      }
    }
  },
  "LAYOUT_BODY": {
    "heading": "",
    "subHeading": "",
    "dataCorasoul": {},
    "sections": [
      {},
      {}
    ],
    "MenuItemData": [
      {
      }
    ]
  },
  "LAYOUT_FOOTER": {
    "footerLabel": `2024 AastarUrmika Health Systems ("Aastrika Foundation")`,
    "menuItems": [
      {
        "heading": "Quick Links",
        "link": "",
        "href": "",
        "links": [
          {
            "label": "Privacy policy",
            "type": "dp",
            "routerLink": "/public/tnc",
          },
          {
            "label": "Terms of Use",
            "type": "tnc",
            "routerLink": "/public/tnc",
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
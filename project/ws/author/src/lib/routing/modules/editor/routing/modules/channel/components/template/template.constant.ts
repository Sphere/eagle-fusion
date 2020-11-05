export const template1Data = {
  widgetData: {
    gutter: 2,
    widgets: [
      [
        {
          dimensions: {},
          widget: {
            widgetData: {
              path: [
                {
                  clickUrl: '/page/home',
                  text: 'Home',
                },
                {
                  text: 'Channels',
                  clickUrl: '/page/lex_auth_0128445903107194886',
                },
                {
                  text: 'Lorem Ipsum is simply dummy text',
                },
              ],
            },
            widgetSubType: 'cardBreadcrumb',
            widgetType: 'card',
            widgetHostClass: 'block',
            widgetHostStyle: {
              'box-sizing': 'border-box',
            },
          },
        },
      ],
      [
        {
          dimensions: {},
          widget: {
            widgetData: {
              template: '<h1 class="mat-h1 inline-block">{{title}}</h1>',
              templateData: {
                title: 'Lorem Ipsum is simply dummy text',
              },
              containerClass: 'h-full',
            },
            widgetSubType: 'elementHtml',
            widgetType: 'element',
            widgetInstanceId: 'be_relevant',
            widgetHostClass: 'block px-6 sm:px-8 md:px-10',
          },
        },
      ],
      [
        {
          dimensions: {
            medium: 8,
            large: 9,
          },
          widget: {
            widgetData: {
              template: '<img class="w-full h-full" src="{{imageSrc}}"/>',
              templateData: {
                imageSrc: '/assets/authoring/sample-templates/images/dummy-image.jpg',
              },
              containerClass: 'h-full',
              containerStyle: {
                height: '400px',
              },
            },
            widgetSubType: 'elementHtml',
            widgetType: 'element',
            widgetHostClass: 'block px-6 sm:px-8 md:px-10 md:pr-0 h-full',
          },
        },
        {
          dimensions: {
            medium: 4,
            large: 3,
          },
          widget: {
            widgetData: {
              template:
                '<div class="p-4 font-normal text-lg leading-normal"><div class="flex flex-wrap mb-2">{{title}}</div></div>',
              templateData: {
                title:
                  // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
              },
              containerClass: 'mat-elevation-z4 h-full',
              containerStyle: {
                'min-height': '370px',
              },
            },
            widgetSubType: 'elementHtml',
            widgetType: 'element',
            widgetHostClass: 'block h-full px-6 sm:px-8 md:px-10 md:pl-0',
          },
        },
      ],
      [
        {
          dimensions: {},
          widget: {
            widgetData: {
              template: '<h1 class="mat-h1 inline-block">{{title}}</h1>',
              templateData: {
                title: 'Lorem Ipsum',
              },
              containerClass: 'h-full',
            },
            widgetSubType: 'elementHtml',
            widgetType: 'element',
            widgetInstanceId: 'digitrack',
            widgetHostClass: 'block px-6 sm:px-8 md:px-10 pt-6',
          },
        },
      ],
      [
        {
          dimensions: {
            large: 6,
          },
          widget: {
            widgetData: {
              strips: [
                {
                  key: 'some_key',
                  title: '',
                  preWidgets: [
                    {
                      widgetData: {
                        template:
                          // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                          '<div style="{{cardStyle}}" class="flex flex-col justify-end relative h-full">\n <div class="w-full" style="margin-bottom: 50px">\n </div>\n</div>',
                        templateData: {
                          cardStyle:
                            // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                            "background-size: cover !important; background : url('/assets/authoring/sample-templates/images/dummy-image.jpg'); width:265px",
                        },
                        containerClass: 'h-full',
                        containerStyle: {
                          'min-height': '370px',
                        },
                      },
                      widgetSubType: 'elementHtml',
                      widgetType: 'element',
                      widgetHostClass: 'sticky-m mat-elevation-z4',
                    },
                  ],
                  request: {
                    ids: [
                      'lex_auth_0128411828658831362970',
                      'lex_auth_0128411795900088323019',
                      'lex_auth_0128411798633840642979',
                    ],
                  },
                },
              ],
            },
            widgetSubType: 'contentStripMultiple',
            widgetType: 'contentStrip',
            widgetHostClass: 'block lg:-my-10',
          },
        },
        {
          dimensions: {
            large: 3,
            medium: 6,
          },
          widget: {
            widgetData: {
              image: '/assets/authoring/sample-templates/images/dummy-image.jpg',
              key: 'over_digitalization_3',
              title: 'Most Viewed',
              request: {
                ids: [
                  'lex_auth_0128411753677537281804',
                  'lex_auth_0128411764688322562548',
                  'lex_auth_0128411964775383044430',
                ],
              },
            },
            widgetSubType: 'contentStripSingle',
            widgetType: 'contentStrip',
          },
        },
        {
          dimensions: {
            large: 3,
            medium: 6,
          },
          widget: {
            widgetData: {
              template:
                // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                '<div style="background-size: cover; background-repeat:no-repeat; background-image: url({{imageSrc}})" class="flex items-center justify-end w-full h-32"> <span style="background: rgba(0, 97, 135, 0.8)" class="text-white text-2xl font-semibold bg-blue-400 pl-4 pr-3 py-6"> {{title}} </span></div> {{#items}}<div class="px-6 shadow py-4 my-2 rounded"> <a href="{{link}}" target="_blank"> <span class="block text-xs text-left">{{date}}</span><div class="flex justify-between"><div class="block text-base truncate text-blue-700 pt-1">{{leftText}}</div></div> </a></div> {{/items}}',
              templateData: {
                imageSrc: '/assets/authoring/sample-templates/images/dummy-image.jpg',
                title: 'Most Viewed',
                items: [
                  {
                    date: '27 Aug, 2019',
                    leftText: 'Lorem Ipsum is simply dummy text',
                    link: '',
                  },
                  {
                    date: '27 Aug, 2019',
                    leftText: 'Lorem Ipsum is simply dummy text',
                    link: '',
                  },
                  {
                    date: '09 Aug, 2019',
                    leftText: 'Lorem Ipsum is simply dummy text',
                    link: '',
                  },
                ],
              },
              containerClass: 'h-full',
            },
            widgetSubType: 'elementHtml',
            widgetType: 'element',
            widgetHostClass: 'block h-full px-6 sm:px-8 md:px-10 lg:pl-0 md:pr-0',
          },
        },
      ],
      [
        {
          dimensions: {},
          widget: {
            widgetData: {
              template: '<h1 class="mat-h1 inline-block">{{title}}</h1>',
              templateData: {
                title: 'Lorem Ipsum',
              },
              containerClass: 'h-full',
            },
            widgetSubType: 'elementHtml',
            widgetType: 'element',
            widgetHostClass: 'block px-6 sm:px-8 md:px-10 pt-6 -mb-8',
          },
        },
      ],
      [
        {
          dimensions: {
            large: 6,
          },
          widget: {
            widgetData: {
              strips: [
                {
                  key: 'over_digitalization_3',
                  title: '',
                  preWidgets: [
                    {
                      widgetData: {
                        template:
                          // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                          '<div style="width:265px; background:white" class="h-full"><img class="w-full h-full" src="{{imageSrc}}"/></div>',
                        templateData: {
                          imageSrc: '/assets/authoring/sample-templates/images/dummy-image.jpg',
                        },
                        containerClass: 'h-full',
                        containerStyle: {},
                      },
                      widgetSubType: 'elementHtml',
                      widgetType: 'element',
                      widgetHostClass: 'sticky-m mat-elevation-z4',
                    },
                  ],
                  request: {
                    ids: [
                      'lex_auth_0128411753677537281804',
                      'lex_auth_0128411764688322562548',
                      'lex_auth_0128411964775383044430',
                      'lex_auth_012841111598522368604',
                      'lex_auth_0128411901510451204432',
                      'lex_auth_0128411911752253444433',
                      'lex_auth_0128411976737914884431',
                    ],
                  },
                },
              ],
            },
            widgetSubType: 'contentStripMultiple',
            widgetType: 'contentStrip',
          },
        },
        {
          dimensions: {
            large: 6,
          },
          widget: {
            widgetData: {
              strips: [
                {
                  key: 'over_digitalization_4',
                  title: '',
                  preWidgets: [
                    {
                      widgetData: {
                        template:
                          // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                          '<div style="width:265px; background:white" class="h-full"><img class="w-full h-full" src="{{imageSrc}}"/></div>',
                        templateData: {
                          imageSrc: '/assets/authoring/sample-templates/images/dummy-image.jpg',
                        },
                        containerClass: 'h-full',
                        containerStyle: {},
                      },
                      widgetSubType: 'elementHtml',
                      widgetType: 'element',
                      widgetHostClass: 'sticky-m mat-elevation-z4',
                    },
                  ],
                  request: {
                    ids: [
                      'lex_auth_0128411753677537281804',
                      'lex_auth_0128411764688322562548',
                      'lex_auth_0128411964775383044430',
                      'lex_auth_012841111598522368604',
                      'lex_auth_0128411901510451204432',
                      'lex_auth_0128411911752253444433',
                      'lex_auth_0128411976737914884431',
                    ],
                  },
                },
              ],
            },
            widgetSubType: 'contentStripMultiple',
            widgetType: 'contentStrip',
            widgetHostClass: 'block lg:-ml-10',
          },
        },
      ],
      [
        {
          dimensions: {
            large: 6,
          },
          widget: {
            widgetData: {
              strips: [
                {
                  key: 'over_digitalization_2',
                  title: '',
                  preWidgets: [
                    {
                      widgetData: {
                        // tslint:disable-next-line: max-line-length
                        template:
                          '<div style="width:265px; background:white" class="h-full"><img class="w-full h-full" src="{{imageSrc}}"/></div>',
                        templateData: {
                          imageSrc: '/assets/authoring/sample-templates/images/dummy-image.jpg',
                        },
                        containerClass: 'h-full',
                        containerStyle: {},
                      },
                      widgetSubType: 'elementHtml',
                      widgetType: 'element',
                      widgetHostClass: 'sticky-m mat-elevation-z4',
                    },
                  ],
                  request: {
                    ids: [
                      'lex_auth_0128411753677537281804',
                      'lex_auth_0128411764688322562548',
                      'lex_auth_0128411964775383044430',
                      'lex_auth_012841111598522368604',
                      'lex_auth_0128411901510451204432',
                      'lex_auth_0128411911752253444433',
                      'lex_auth_0128411976737914884431',
                    ],
                  },
                },
              ],
            },
            widgetSubType: 'contentStripMultiple',
            widgetType: 'contentStrip',
          },
        },
        {
          dimensions: {
            large: 6,
          },
          widget: {
            widgetData: {
              strips: [
                {
                  key: 'over_digitalization_1',
                  title: '',
                  preWidgets: [
                    {
                      widgetData: {
                        // tslint:disable-next-line: max-line-length
                        template:
                          '<div style="width:265px; background:white" class="h-full"><img class="w-full h-full" src="{{imageSrc}}"/></div>',
                        templateData: {
                          imageSrc: '/assets/authoring/sample-templates/images/dummy-image.jpg',
                        },
                        containerClass: 'h-full',
                        containerStyle: {},
                      },
                      widgetSubType: 'elementHtml',
                      widgetType: 'element',
                      widgetHostClass: 'sticky-m mat-elevation-z4',
                    },
                  ],
                  request: {
                    ids: [
                      'lex_auth_0128411753677537281804',
                      'lex_auth_0128411764688322562548',
                      'lex_auth_0128411964775383044430',
                      'lex_auth_012841111598522368604',
                      'lex_auth_0128411901510451204432',
                      'lex_auth_0128411911752253444433',
                      'lex_auth_0128411976737914884431',
                    ],
                  },
                },
              ],
            },
            widgetSubType: 'contentStripMultiple',
            widgetType: 'contentStrip',
            widgetHostClass: 'block lg:-ml-10',
          },
        },
      ],
      [
        {
          dimensions: {},
          widget: {
            widgetData: {
              strips: [
                {
                  key: 'some_key_1',
                  title: 'Lorem Ipsum is simply dummy text',
                  preWidgets: [
                    {
                      widgetData: {
                        template:
                          // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                          '<a target="_blank" href="{{link}}"><div style="{{cardStyle}}" class="flex flex-col justify-end relative h-full">\n <div class="w-full" style="margin-bottom: 50px">\n <span style="{{overlayStyle}}" class="flex items-center p-6 text-2xl leading-none font-normal">{{overlayText}}</span>\n </div>\n</div></a>',
                        templateData: {
                          link:
                            // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                            'https://www.yammer.com/siemens.com/#/threads/inGroup?type=in_group&feedId=17128474',

                          cardStyle:
                            // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                            "background-size: cover !important; background : url('/assets/authoring/sample-templates/images/dummy-image.jpg'); width:265px",
                          overlayText: 'Lorem Ipsum is simply dummy text',
                          overlayStyle: 'background:#005f87cc;color:white;opacity:0.8;',
                        },
                        containerClass: 'h-full',
                        containerStyle: {
                          'min-height': '370px',
                        },
                      },
                      widgetSubType: 'elementHtml',
                      widgetType: 'element',
                      widgetHostClass: 'sticky-m mat-elevation-z4',
                    },
                    {
                      widgetData: {
                        template:
                          // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                          '<a target="_blank" href="{{link}}"><div style="{{cardStyle}}" class="flex flex-col justify-end relative h-full">\n <div class="w-full" style="margin-bottom: 50px">\n <span style="{{overlayStyle}}" class="flex items-center p-6 text-2xl leading-none font-normal">{{overlayText}}</span>\n </div>\n</div></a>',
                        templateData: {
                          link:
                            // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                            'https://www.yammer.com/siemens.com/#/threads/inGroup?type=in_group&feedId=17725148',

                          cardStyle:
                            // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                            "background-size: cover !important; background : url('/assets/authoring/sample-templates/images/dummy-image.jpg'); width:265px",
                          overlayText: 'Lorem Ipsum is simply dummy text',
                          overlayStyle: 'background:#005f87cc;color:white;opacity:0.8;',
                        },
                        containerClass: 'h-full',
                        containerStyle: {
                          'min-height': '370px',
                        },
                      },
                      widgetSubType: 'elementHtml',
                      widgetType: 'element',
                      widgetHostClass: 'mat-elevation-z4',
                    },
                  ],
                },
              ],
            },
            widgetSubType: 'contentStripMultiple',
            widgetType: 'contentStrip',
          },
        },
      ],
    ],
  },
  widgetSubType: 'gridLayout',
  widgetType: 'layout',
}

export const template2Data = {
  widgetData: {
    gutter: 2,
    widgets: [
      [
        {
          dimensions: {},
          widget: {
            widgetData: {
              path: [
                {
                  clickUrl: '/page/home',
                  text: 'Home',
                },
                {
                  text: 'Channels',
                  clickUrl: '/page/lex_auth_0128445903107194886',
                },
                {
                  text: 'Lorem ipsum ',
                },
              ],
            },
            widgetSubType: 'cardBreadcrumb',
            widgetType: 'card',
            widgetHostClass: 'block',
            widgetHostStyle: {
              'box-sizing': 'border-box',
            },
          },
        },
      ],
      [
        {
          dimensions: {
            medium: 8,
            large: 9,
          },
          widget: {
            widgetType: 'selector',
            widgetSubType: 'selectorResponsive',
            widgetData: {
              selectFrom: [
                {
                  minWidth: 1300,
                  maxWidth: 500090000,
                  widget: {
                    widgetData: {
                      imageHeight: '472',
                      imageWidth: '991',
                      imageSrc: '/assets/authoring/sample-templates/images/dummy-image.jpg',
                      mapName: 'map-digital-enterprise',
                      map: [
                        {
                          coords: [44, 197, 178, 241],
                          alt: 'Hot Topics',
                          title: 'Hot Topics',
                          link: './page/siemens-digital-enterprise#hot_topics',
                          target: '',
                        },
                        {
                          coords: [86, 273, 351, 316],
                          alt: 'Learning activities @DF',
                          title: 'Learning activities @DF',
                          link: './page/siemens-digital-enterprise#learning_activities_df',
                          target: '',
                        },
                        {
                          coords: [128, 351, 662, 393],
                          alt: 'What you need to drive your digital transformation',
                          title: 'What you need to drive your digital transformation',
                          link: './page/siemens-digital-enterprise#digital_transformation_leader',
                          target: '',
                        },
                      ],
                      containerClass: 'h-full',
                      containerStyle: {
                        'min-height': '460px',
                      },
                    },
                    widgetSubType: 'imageMapResponsive',
                    widgetType: 'imageMap',
                    widgetHostClass: 'block px-6 sm:px-8 md:px-10 md:pr-0 h-full',
                    widgetInstanceId: 'digital-enterprise',
                  },
                },
                {
                  minWidth: 0,
                  maxWidth: 1299,
                  widget: {
                    widgetData: {
                      template:
                        // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                        '<div class="font-semibold text-white flex items-center justify-center text-2xl sm:text-4xl p-4 leading-normal">{{boxTitle}}</div><div class="w-full flex flex-col flex-wrap"> {{#items}} <a href="{{__pageBase}}#{{bookmarkRef}}" style="width: fit-content" "><div class="leading-normal m-4 h-full flex items-center justify-center text-center text-xl font-normal rounded" style="{{style}}"><div class="p-2">{{title}}</div></div> </a>{{/items}}</div>',
                      templateData: {
                        boxTitle: 'Digital Enterprise',
                        items: [
                          {
                            style: 'color: white; background: #f5994e;opacity: 0.8;',
                            title: 'Hot Topics',
                            bookmarkRef: 'hot_topics',
                          },
                          {
                            style: 'color: white; background: #f5994e;opacity: 0.8;',
                            title: 'Learning activities@DF',
                            bookmarkRef: 'learning_activities_df',
                          },
                          {
                            style: 'color: white; background: #f5994e;opacity: 0.8;',
                            title: 'What you need to drive your digital transformation',
                            bookmarkRef: 'digital_transformation_leader',
                          },
                        ],
                      },
                      containerClass: 'mat-elevation-z4 h-full',
                      containerStyle: {
                        'background-image':
                          // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                          "url('/assets/authoring/sample-templates/images/dummy-image.jpg')",
                        'background-repeat': 'no-repeat',
                        'min-height': '350px',
                      },
                    },
                    widgetSubType: 'elementHtml',
                    widgetType: 'element',
                    widgetHostClass: 'block px-6 sm:px-8 md:px-10 h-full md:pr-0',
                  },
                },
              ],
            },
          },
        },
        {
          dimensions: {
            large: 3,
            medium: 4,
          },
          widget: {
            widgetData: {
              template:
                // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                '<div class="flex flex-col justify-center w-full"><div><img class="w-full h-full" src={{imageSrc}}></div><div class="mat-title px-4">{{desc}}</div></div>',
              templateData: {
                imageSrc: '/assets/authoring/sample-templates/images/dummy-image.jpg',
                desc:
                  // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
              },
              containerClass: 'h-full mat-elevation-z4',
            },
            widgetSubType: 'elementHtml',
            widgetType: 'element',
            widgetHostClass: 'block h-full px-6 sm:px-8 md:px-10 md:pl-0',
          },
        },
      ],
      [
        {
          dimensions: {},
          widget: {
            widgetData: {
              strips: [
                {
                  key: 'hot_topics',
                  title: 'Lorem ipsum dolor sit amet',
                  request: {
                    ids: [
                      'lex_auth_0128411691023237121633',
                      'lex_auth_0128411719889960961630',
                      'lex_auth_0128411721845145601632',
                      'lex_auth_0128411653168988161390',
                    ],
                  },
                },
                {
                  key: 'learning_activities_df',
                  title: 'Lorem ipsum dolor sit amet',
                  request: {
                    ids: [
                      'lex_auth_0128411829221457923188',
                      'lex_auth_0128411843300720643191',
                      'lex_auth_0128411831723950083193',
                      'lex_auth_0128411824628695043195',
                      'lex_auth_0128411796288880642323',
                      'lex_auth_0128411718311608321635',
                      'lex_auth_0128411719889960961630',
                      'lex_auth_0128411735457464321636',
                      'lex_auth_0128411691023237121633',
                      'lex_auth_0128411701849292801631',
                    ],
                  },
                },
              ],
            },
            widgetSubType: 'contentStripMultiple',
            widgetType: 'contentStrip',
          },
        },
      ],
      [
        {
          dimensions: {},
          widget: {
            widgetData: {
              template: '<h1 class="mat-h1 margin-remove inline-block">{{title}}</h1>',
              templateData: {
                title: 'Lorem Ipsum is simply dummy text of the printing',
              },
              containerClass: 'h-full',
            },
            widgetSubType: 'elementHtml',
            widgetType: 'element',
            widgetInstanceId: 'scm_procurement',
            widgetHostClass: 'block px-6 sm:px-8 md:px-10 pt-6 -mb-8',
          },
        },
      ],
      [
        {
          dimensions: {
            medium: '6',
          },
          widget: {
            widgetData: {
              strips: [
                {
                  key: 'dive_deeper',
                  title: '',
                  preWidgets: [
                    {
                      widgetData: {
                        template:
                          // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                          '<a target="_blank" href="{{link}}"> <div style="{{cardStyle}}" class="flex flex-col justify-end relative h-full">\n <div class="w-full" style="margin-bottom: 50px">\n <span style="{{overlayStyle}}" class="flex items-center p-6 text-2xl leading-none ">{{overlayText}}</span>\n </div>\n</div></a>',
                        templateData: {
                          cardStyle:
                            // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                            "background-size: cover !important; background : url('/assets/authoring/sample-templates/images/dummy-image.jpg'); width:265px",
                          overlayText: 'Lorem Ipsum is simply dummy text',
                          overlayStyle: 'background:#005f87cc;color:white;opacity:0.9;',
                          link: './page/technologies',
                        },
                        containerClass: 'h-full',
                      },
                      widgetSubType: 'elementHtml',
                      widgetType: 'element',
                      widgetHostClass: 'sticky-m mat-elevation-z4',
                    },
                  ],
                  request: {
                    ids: [
                      'lex_auth_0128411723385569281476',
                      'lex_auth_0128411689762652161373',
                      'lex_auth_0128411710297702401371',
                      'lex_auth_012841166560583680977',
                      'lex_auth_01284110212831641618',
                      'lex_auth_012841103581609984273',
                    ],
                  },
                },
              ],
            },
            widgetSubType: 'contentStripMultiple',
            widgetType: 'contentStrip',
          },
        },
        {
          dimensions: {
            medium: '6',
          },
          widget: {
            widgetData: {
              strips: [
                {
                  key: 'dive_deeper_1',
                  title: '',
                  request: {
                    ids: [
                      'lex_auth_0128411837496770562992',
                      'lex_auth_0128411771852636162047',
                      'lex_auth_0128411726357135362046',
                      'lex_auth_012841106102845440614',
                      'lex_auth_0128411686624870401744',
                      'lex_auth_0128411718311608321635',
                      'lex_auth_0128411729938432001638',
                      'lex_auth_0128411735457464321636',
                      'lex_auth_0128411659019960321465',
                      'lex_auth_0128411648170557441466',
                      'lex_auth_01284110212831641618',
                      'lex_auth_012841103581609984273',
                    ],
                  },
                },
              ],
            },
            widgetSubType: 'contentStripMultiple',
            widgetType: 'contentStrip',
            widgetHostClass: 'block lg:-ml-10',
          },
        },
      ],
      [
        {
          dimensions: {},
          widget: {
            widgetData: {
              strips: [
                {
                  key: 'workplace',
                  title: 'Lorem ipsum dolor sit amet',
                  postWidgets: [
                    {
                      widgetData: {
                        template:
                          // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                          '<a target="_blank" href="{{link}}"> <div style="{{cardStyle}}" class="flex flex-col justify-end relative h-full">\n <div class="w-full" style="margin-bottom: 50px">\n <span style="{{overlayStyle}}" class="flex items-center p-6 text-2xl leading-none ">{{overlayText}}</span>\n </div>\n</div></a>',
                        templateData: {
                          cardStyle:
                            // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                            "background-size: cover !important; background : url('/assets/authoring/sample-templates/images/dummy-image.jpg'); width:265px",
                          overlayText:
                            'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                          overlayStyle: 'background:#005f87cc;color:white;opacity:0.9;',
                          link: './page/siemens-virtual-collaboration',
                        },
                        containerClass: 'h-full',
                      },
                      widgetSubType: 'elementHtml',
                      widgetType: 'element',
                      widgetHostClass: 'sticky-m mat-elevation-z4',
                    },
                  ],
                  request: {
                    ids: [
                      'lex_auth_0128411665229742081374',
                      'lex_auth_012841165624532992952',
                      'lex_auth_012841160294572032957',
                      'lex_auth_012841164329050112956',
                    ],
                  },
                },
                {
                  key: 'digital_transformation',
                  title: 'Lorem ipsum dolor sit amet',
                  request: {
                    ids: [
                      'lex_auth_0128411704881725441634',
                      'lex_auth_0128411675803811841528',
                      'lex_auth_0128411694297907201789',
                    ],
                  },
                },
                {
                  key: 'digital_transformation_leader',
                  title: 'Lorem ipsum dolor sit amet',
                  postWidgets: [
                    {
                      widgetData: {
                        template:
                          // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                          '<a target="_blank" href="{{link}}"> <div style="{{cardStyle}}" class="flex flex-col justify-end relative h-full">\n <div class="w-full" style="margin-bottom: 50px">\n <span style="{{overlayStyle}}" class="flex items-center p-6 text-2xl leading-none ">{{overlayText}}</span>\n </div>\n</div></a>',
                        templateData: {
                          cardStyle:
                            // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
                            "background-size: cover !important; background : url('/assets/authoring/sample-templates/images/dummy-image.jpg'); width:265px",
                          overlayText: 'Lorem Ipsum is simply dummy text',
                          overlayStyle: 'background:#005f87cc;color:white;opacity:0.9;',
                          link: './page/leadership',
                        },
                        containerClass: 'h-full',
                      },
                      widgetSubType: 'elementHtml',
                      widgetType: 'element',
                      widgetHostClass: 'sticky-m mat-elevation-z4',
                    },
                  ],
                  request: {
                    ids: [
                      'lex_auth_0128411831723950083193',
                      'lex_auth_0128411723662622721642',
                      'lex_auth_012841109507850240608',
                      'lex_auth_012841103326691328399',
                      'lex_auth_0128411777740554242002',
                      'lex_auth_0128411928484823043908',
                    ],
                  },
                },
              ],
            },
            widgetSubType: 'contentStripMultiple',
            widgetType: 'contentStrip',
          },
        },
      ],
    ],
  },
  widgetSubType: 'gridLayout',
  widgetType: 'layout',
}

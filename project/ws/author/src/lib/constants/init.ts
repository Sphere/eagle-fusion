import { IInitialSetup } from '../interface/initialSetup'
import { IFormMeta } from '../interface/form'

export const AUTH_INIT: IInitialSetup = {
  contentTypes: [
    {
      name: 'resource',
      displayName: 'Resource',
      icon: 'insert_drive_file',
      additionalMessage: 'Create smallest learning entity',
      contentType: '',
      mimeType: '',
      resourceType: '',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'creator',
        'content-creator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'InReview',
            'Reviewed',
            'Live',
          ],
          conditional: [
            {
              condition: {
                mimeType: [
                  'application/pdf',
                  'application/x-mpegURL',
                  'audio/mpeg',
                ],
              },
              flow: [
                'Draft',
                'Reviewed',
                'Live',
              ],
            },
            {
              condition: {
                mimeType: [
                  'application/html',
                ],
              },
              flow: [
                'Draft',
                'Reviewed',
                'Live',
              ],
            },
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'InReview',
            'Reviewed',
            'Live',
          ],
          conditional: [
            {
              condition: {
                mimeType: [
                  'application/pdf',
                  'application/x-mpegURL',
                  'audio/mpeg',
                ],
              },
              flow: [
                'Draft',
                'Reviewed',
                'Live',
              ],
            },
            {
              condition: {
                mimeType: [
                  'application/html',
                ],
              },
              flow: [
                'Draft',
                'Live',
              ],
            },
          ],
        },
      } as any,
      additionalMeta: {
        isExternal: false,
        isIframeSupported: 'Yes',
      } as any,
      children: [
        'url',
        'pdf',
        'video',
        'audio',
        'assessment',
        'quiz',
      ],
    },
    {
      name: 'pdf',
      displayName: 'Upload a PDF',
      icon: 'insert_drive_file',
      additionalMessage: 'Create a Resource by uploading PDF file',
      contentType: 'Resource',
      mimeType: 'application/pdf',
      resourceType: '',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'creator',
        'content-creator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
      } as any,
      additionalMeta: {
        isExternal: false,
        isIframeSupported: 'Yes',
      } as any,
      children: [] as any,
    },
    {
      name: 'video',
      displayName: 'Upload a Video',
      icon: 'insert_drive_file',
      additionalMessage: 'Create a Resource by uploading video (.mp4) file',
      contentType: 'Resource',
      mimeType: 'application/x-mpegURL',
      resourceType: '',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'creator',
        'content-creator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
      },
      additionalMeta: {
        isExternal: false,
        isIframeSupported: 'Yes',
      } as any,
      children: [] as any,
    },
    {
      name: 'audio',
      displayName: 'Upload a Audio',
      icon: 'insert_drive_file',
      additionalMessage: 'Create a Resource by uploading audio (.mp3) file',
      contentType: 'Resource',
      mimeType: 'audio/mpeg',
      resourceType: '',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'creator',
        'content-creator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
      },
      additionalMeta: {
        isExternal: false,
        isIframeSupported: 'Yes',
      } as any,
      children: [] as any,
    },
    {
      name: 'url',
      displayName: 'Attach a link',
      icon: 'insert_drive_file',
      additionalMessage: 'Create a Resource by providing an external link (URL)',
      contentType: 'Resource',
      mimeType: 'application/html',
      resourceType: '',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'creator',
        'content-creator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'Live',
          ],
        },
      },
      additionalMeta: {
        isExternal: true,
        isIframeSupported: 'No',
      } as any,
      children: [] as any,
    },
    {
      name: 'assessment',
      displayName: 'Assessment',
      icon: 'check_circle',
      additionalMessage: 'Create an Assessment by providing minimum 10 question',
      contentType: 'Resource',
      mimeType: 'application/quiz',
      resourceType: 'Assessment',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'creator',
        'content-creator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'Live',
          ],
        },
      },
      additionalMeta: {
        isExternal: false,
        isIframeSupported: 'Yes',
      } as any,
      children: [] as any,
    },
    {
      name: 'quiz',
      displayName: 'Quiz',
      icon: 'check_circle',
      additionalMessage: 'Create a quiz',
      contentType: 'Resource',
      mimeType: 'application/quiz',
      resourceType: 'Quiz',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'creator',
        'content-creator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'Live',
          ],
        },
      },
      additionalMeta: {
        isExternal: false,
        isIframeSupported: 'Yes',
      } as any,
      children: [] as any,
    },
    {
      name: 'channel',
      children: [],
      displayName: 'Channel',
      icon: 'chrome_reader_mode',
      additionalMessage: 'Create a Channel Page',
      contentType: 'Channel',
      mimeType: 'application/channel',
      resourceType: '',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'channel-creator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'InReview',
            'Reviewed',
            'Live',
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'InReview',
            'Reviewed',
            'Live',
          ],
        },
      },
      additionalMeta: {
        isExternal: false,
        isIframeSupported: 'Yes',
      } as any,
    },
    {
      name: 'kboard',
      children: [],
      displayName: 'Knowledge Board',
      icon: 'folder',
      additionalMessage: 'Create a Knowledge Board',
      contentType: 'Knowledge Board',
      mimeType: 'application/vnd.ekstep.content-collection',
      resourceType: '',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'kb-curator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
      },
      additionalMeta: {
        isExternal: false,
        isIframeSupported: 'Yes',
      } as any,
    },
    {
      name: 'module',
      children: [],
      displayName: 'Module',
      icon: 'folder',
      additionalMessage: 'Create a collection of Resources',
      contentType: 'Collection',
      mimeType: 'application/vnd.ekstep.content-collection',
      resourceType: '',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'kb-curator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'InReview',
            'Reviewed',
            'Live',
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'InReview',
            'Reviewed',
            'Live',
          ],
        },
      },
      additionalMeta: {
        isExternal: false,
        isIframeSupported: 'Yes',
      } as any,
    },
    {
      name: 'course',
      children: [
        'internalCourse',
        'externalCourse',
      ],
      displayName: 'Course',
      icon: 'folder',
      additionalMessage: 'Create a collection of Modules',
      contentType: 'Course',
      mimeType: 'application/vnd.ekstep.content-collection',
      resourceType: '',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'kb-curator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'InReview',
            'Reviewed',
            'Live',
          ],
          conditional: [
            {
              condition: {
                isExternal: [
                  true,
                ],
              },
              flow: [
                'Draft',
                'Reviewed',
                'Live',
              ],
            },
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'InReview',
            'Reviewed',
            'Live',
          ],
          conditional: [
            {
              condition: {
                isExternal: [
                  true,
                ],
              },
              flow: [
                'Draft',
                'Live',
              ],
            },
          ],
        },
      } as any,
      additionalMeta: {
        isExternal: false,
        isIframeSupported: 'Yes',
      } as any,
    },
    {
      name: 'interanlCourse',
      children: [],
      displayName: 'Internal Course',
      icon: 'folder',
      additionalMessage: 'Create a collection of Modules',
      contentType: 'Course',
      mimeType: 'application/vnd.ekstep.content-collection',
      resourceType: '',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'kb-curator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'InReview',
            'Reviewed',
            'Live',
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'InReview',
            'Reviewed',
            'Live',
          ],
        },
      },
      additionalMeta: {
        isExternal: false,
        isIframeSupported: 'Yes',
      } as any,
    },
    {
      name: 'externalCourse',
      children: [],
      displayName: 'External Course',
      icon: 'folder',
      additionalMessage: 'Create an external course by providing link',
      contentType: 'Course',
      mimeType: 'application/vnd.ekstep.content-collection',
      resourceType: '',
      hasEnabled: true,
      canShow: true,
      allowedRoles: [
        'author',
        'kb-curator',
        'editor',
        'admin',
        'content-admin',
        'super-admin',
      ],
      flow: {
        internalFlow: {
          common: [
            'Draft',
            'Reviewed',
            'Live',
          ],
        },
        externalFlow: {
          common: [
            'Draft',
            'InReview',
            'Reviewed',
            'Live',
          ],
        },
      },
      additionalMeta: {
        isExternal: true,
        isIframeSupported: 'No',
      } as any,
    },
  ],
  roles: {
    author: {
      admin: {} as any,
      editor: {
        condition: {
          status: ['Draft'],
        } as any,
      },
      'content-admin': {} as any,
      'super-admin': {} as any,
      'content-creator': {
        condition: {
          status: ['Draft'],
        } as any,
        fields: ['creatorContacts'],
      },
    },
    review: {
      admin: {} as any,
      'content-admin': {} as any,
      'super-admin': {} as any,
      reviewer: {
        condition: {
          status: ['InReview'],
        } as any,
        fields: ['trackContacts'],
      },
    },
    publish: {
      admin: {} as any,
      'content-admin': {} as any,
      'super-admin': {} as any,
      publisher: {
        condition: {
          status: ['Reviewed'],
        } as any,
        fields: ['publisherDetails'],
      },
    },
    qualityReview: {
      admin: {} as any,
      'content-admin': {} as any,
      'super-admin': {} as any,
      'quality-reviewer': {
        condition: {
          status: ['QualityReview'],
        } as any,
        fields: ['publisherDetails'],
      },
    },
    view: {
      admin: {} as any,
      'content-admin': {} as any,
      'super-admin': {} as any,
      'quality-reviewer': {
        condition: {
          status: ['QualityReview'],
        } as any,
        fields: ['publisherDetails'],
      },
      reviewer: {
        condition: {
          status: ['InReview'],
        } as any,
        fields: ['trackContacts'],
      },
      publisher: {
        condition: {
          status: ['Reviewed'],
        } as any,
        fields: ['publisherDetails'],
      },
    },
  },
  form: {
    accessibility: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    accessPaths: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,

        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    appIcon: {
      mandatoryFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    artifactUrl: {
      mandatoryFor: {
        Resource: [] as any,
        Course: [] as any,
      } as any,
      notMandatoryFor: {
        Resource: [
          {
            mimeType: ['application/html'],
            body: [true],
          } as any,
        ],
        Course: [
          { body: [true] } as any,
        ],
      } as any,
      showFor: {
        Resource: [
          { mimeType: ['application/html'] } as any,
        ],
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    audience: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    body: {
      mandatoryFor: {
        Course: [] as any,
        Resource: [] as any,
      } as any,
      notMandatoryFor: {
        Resource: [
          {
            mimeType: ['application/html'],
            artifactUrl: [true],
          } as any,
        ],
        Course: [
          { artifactUrl: [true] } as any,
        ],
      } as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    catalogPaths: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    category: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    categoryType: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    certificationList: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    certificationUrl: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    clients: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    complexityLevel: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        'Knowledge Artifact': [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    comments: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    contentLanguage: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: null as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: null as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: null as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: null as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    transcoding: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: null as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: null as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: null as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: null as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: null as any,
        }],
      } as any,
      type: 'object',
    },
    concepts: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    contentIdAtSource: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    identifier: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    scoreType: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    contentType: {
      mandatoryFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
        Resource: [{ mimeType: ['application/pdf', 'audio/mpeg', 'application/x-mpegURL'] }],
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    creatorContacts: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    creatorDetails: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    customClassifiers: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    description: {
      mandatoryFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    dimension: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    duration: {
      mandatoryFor: {
        Course: [] as any,
        Resource: [] as any,
      } as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: 0,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: 0,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: 0,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: 0,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: 0,
        }],
      } as any,
      type: 'number',
    },
    editors: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    equivalentCertifications: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    expiryDate: {
      mandatoryFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    fileType: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        'Knowledge Artifact': [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    additionalDownloadLink: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        'Knowledge Artifact': [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    idealScreenSize: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        'Knowledge Artifact': [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    introductoryVideo: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        } as any, {
          condition: {
            mimeType: ['application/html'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    introductoryVideoIcon: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        } as any, {
          condition: {
            mimeType: ['application/html'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    isExternal: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: true,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: false,
        } as any, {
          condition: {
            mimeType: ['application/html'],
          } as any,
          value: true,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: false,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: false,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: false,
        }],
      } as any,
      type: 'boolean',
    },
    isRejected: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: true,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: false,
        } as any, {
          condition: {
            mimeType: ['application/html'],
          } as any,
          value: true,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: false,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: false,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: false,
        }],
      } as any,
      type: 'boolean',
    },
    isIframeSupported: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: 'Yes',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: 'Yes',
        } as any, {
          condition: {
            mimeType: ['application/html'],
          } as any,
          value: 'No',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: 'Yes',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: 'Yes',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: 'Yes',
        }],
      } as any,
      type: 'string',
    },
    isInIntranet: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: false,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: false,
        } as any, {
          condition: {
            mimeType: ['application/html'],
          } as any,
          value: false,
        }],
        'Knowledge Board': [{
          condition: {
            ontentType: ['Knowledge Board'],
          } as any,
          value: false,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: false,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: false,
        }],
      } as any,
      type: 'boolean',
    },
    kArtifacts: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    keywords: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        'Knowledge Artifact': [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    learningMode: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        } as any, {
          condition: {
            mimeType: ['application/html'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    learningObjective: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        } as any, {
          condition: {
            mimeType: ['application/html'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    learningTrack: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        } as any, {
          condition: {
            mimeType: ['application/html'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    locale: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        } as any, {
          condition: {
            mimeType: ['application/html'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    mimeType: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    name: {
      mandatoryFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    nodeType: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        } as any, {
          condition: {
            mimeType: ['application/html'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    org: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    passPercentage: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: 0,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: 0,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: 0,
        }],
        'Knowledge Artifact': [{
          con: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: 0,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: 0,
        }],
      } as any,
      type: 'number',
    },
    plagScan: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    playgroundInstructions: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    playgroundResources: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    posterImage: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    preContents: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    preRequisites: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    projectCode: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    publicationId: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    postContents: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    publisherDetails: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        'Knowledge Board': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {
        Resource: [{ mimeType: ['application/html'] }],
      } as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    references: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    region: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        'Knowledge Artifact': [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    registrationInstructions: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    resourceCategory: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    resourceType: {
      mandatoryFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Artifact': [] as any,
      } as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        'Knowledge Board': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    sampleCertificates: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    size: {
      mandatoryFor: {
        Resource: [{ mimeType: ['application/pdf', 'application/x-mpegURL', 'audio/mpeg'] }],
      } as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: 0,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: 0,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['dge Board'],
          } as any,
          value: 0,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: 0,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: 0,
        }],
      } as any,
      type: 'number',
    },
    skills: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    sourceName: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        Channel: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,

      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: 'Learning World',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: 'Learning World',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: 'Learning World',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    exclusiveContent: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        Channel: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,

      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: false,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: false,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: false,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: false,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: false,
        }],
      } as any,
      type: 'boolean',
    },
    status: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    studyDuration: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: 0,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: 0,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: 0,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: 0,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: 0,
        }],
      } as any,
      type: 'number',
    },
    studyMaterials: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    subTitle: {
      mandatoryFor: {
        Course: [] as any,
        Resource: [] as any,
      } as any,
      notMandatoryFor: {} as any,
      showFor: {
        Course: [] as any,
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    subTitles: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    systemRequirements: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    softwareRequirements: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    thumbnail: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {} as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    trackContacts: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Channel: [] as any,
        Resource: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {
        Resource: [{ mimeType: ['application/html'] }],
      } as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    verifiers: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {
        Resource: [{ mimeType: ['application/html'] }],
      } as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: [] as any,
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: [] as any,
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: [] as any,
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: [] as any,
        }],
      } as any,
      type: 'array',
    },
    unit: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: '',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: '',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: '',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: '',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: '',
        }],
      } as any,
      type: 'string',
    },
    visibility: {
      mandatoryFor: {} as any,
      notMandatoryFor: {} as any,
      showFor: {
        Resource: [] as any,
        Course: [] as any,
        'Knowledge Board': [] as any,
        'Knowledge Artifact': [] as any,
        Channel: [] as any,
      } as any,
      notDisabledFor: {} as any,
      disabledFor: {} as any,
      notShowFor: {} as any,
      defaultValue: {
        Course: [{
          condition: {
            contentType: ['Course'],
          } as any,
          value: 'Private',
        }],
        Resource: [{
          condition: {
            contentType: ['Resource'],
          } as any,
          value: 'Private',
        }],
        'Knowledge Board': [{
          condition: {
            contentType: ['Knowledge Board'],
          } as any,
          value: 'Private',
        }],
        'Knowledge Artifact': [{
          condition: {
            contentType: ['Knowledge Artifact'],
          } as any,
          value: 'Private',
        }],
        Channel: [{
          condition: {
            contentType: ['Channel'],
          } as any,
          value: 'Private',
        }],
      } as any,
      type: 'string',
    },
  } as IFormMeta,
}

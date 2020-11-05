export namespace NSContent {
  export type IContentType =
    | 'Learning Path'
    | 'Collection'
    | 'Course'
    | 'Resource'
    | 'Knowledge Artifact'
    | 'Knowledge Board'
    | 'Channel'
  export interface IContentMeta {
    accessPaths: string[]
    identifier: string
    transcoding: any
    name: string
    scoreType: string
    projectCode: string
    fileType: string
    description: string
    keywords: string[]
    additionalDownloadLink: string
    loadingMessage: string
    appIcon: string
    grayScaleAppIcon: string
    thumbnail: string
    contentLanguage: string[]
    plagScan: string
    mediaType: string
    subTitle: string
    contentDescription: string
    expiryDate: string
    locale: string
    isExternalCourse: boolean
    exclusiveContent: boolean
    courseType: 'Instructor-Led' | 'Self Paced'
    contentType: IContentType
    category: IContentType
    visibility: string
    posterImage: string
    language: string[]
    resourceType: string
    categoryType: string
    introductoryVideo: string
    introductoryVideoIcon: string
    isInIntranet: boolean
    msArtifactDetails: IMsArtifacts[]
    idealScreenSize: string
    sourceShortName: string
    sourceName: string
    sourceUrl: string
    playgroundInstructions: string
    registrationInstructions: string
    playgroundResources: any[]
    sourceIconUrl: string
    contentIdAtSource: string
    contentUrlAtSource: string
    extractedTextForSearch: string
    transcript: string
    unit: string
    trackOwner: string
    isIframeSupported: 'Yes' | 'No' | 'MayBe'
    trackContacts: IAuthorDetails[]
    catalogPaths: string[]
    isExternal: boolean
    skills: ISkill[]
    learningObjective: string
    preRequisites: string
    interactivityLevel: string
    complexityLevel: string
    audience: string[]
    duration: number
    size: number
    mimeType: string
    minLexVersion: string
    minOsVersion: number
    os: string[]
    checksum: string
    downloadUrl: string
    artifactUrl: string
    pkgVersion: string
    developer: string
    license: string
    attributions: string[]
    copyright: string[]
    creator: string
    creatorDetails: IAuthorDetails[]
    portalOwner: string
    creatorContacts: IAuthorDetails[]
    submitterDetails: IAuthorDetails
    me_averageInteractionsPerMin: number
    me_totalSessionsCount: number
    me_totalTimespent: number
    me_averageTimespentPerSession: number
    me_totalDevices: number
    me_totalInteractions: number
    me_averageSessionsPerDevice: number
    me_totalSideloads: number
    me_totalComments: number
    me_totalRatings: number
    me_totalDownloads: number
    me_averageRating: number
    publisher: string
    region: string
    publisherDetails: IAuthorDetails[]
    owner: string
    collaborators: string[]
    collaboratorsDetails: IAuthorDetails[]
    voiceCredits: string
    soundCredits: string
    imageCredits: string
    forkable: boolean
    translatable: boolean
    templateType: string
    domain: string
    versionCreatedBy: string
    versionDate: string
    versionKey: number
    lastUpdatedOn: string
    lastUpdatedBy: string
    status: string
    releaseNotes: string
    certificationUrl: string
    preContents: IInternalReference[]
    postContents: IInternalReference[]
    systemRequirements: string[]
    softwareRequirements: IExternalReference[]
    etaTrack: string
    references: IExternalReference[]
    isStandAlone: boolean
    passPercentage: number
    isContentEditingDisabled: boolean
    isMetaEditingDisabled: boolean
    publicationId: string
    subTitles: ISubTitle[]
    isExternalCertificate: boolean
    concepts: IConcept[]
    collections: IDependentContent[]
    children: IContentMeta[]
    certificationList: any[]
    accessibility: string[]
    microsites: string[]
    comments: IComments[]
    stageIcons: string
    editorState: string
    hasAssessment: string
    isRejected: boolean
    resourceCategory: string[]
    customClassifiers: string[]
    clients: IClient[]
    body: string
    org: string[]
    dimension: string
    editors: IAuthorDetails[]
    equivalentCertifications: IInternalReference[]
    kArtifacts: IInternalReference[]
    learningTrack: string
    learningMode: string
    nodeType: string
    verifiers: IAuthorDetails[]
    studyMaterials: IInternalReference[]
    studyDuration: number
    sampleCertificates: IInternalReference[]
    creatorLogo: string
    creatorPosterImage: string
    creatorThumbnail: string
  }

  export interface IClient {
    name: string
    id: string
    displayName: string
  }

  export interface ILanguage {
    label: string
    srclang: string
  }

  export interface IAuthorDetails {
    id: string
    name: string
  }

  export interface IComments {
    date: string
    name: string
    email: string
    comment: string
    action: string
  }

  export interface ISubTitle {
    url: string
    label: string
    srclang: string
  }

  export interface IExternalReference {
    title: string
    url: string
  }

  export interface IInternalReference {
    name: string
    identifier: string
  }

  export interface IMsArtifacts {
    videoId: string
    channelId: string
  }

  export interface ICatalog {
    id: string
    type: string
    value: string
  }

  export interface ISkill {
    identifier: string
    category: string
    skill: string
    name: string
  }

  export interface IConcept {
    identifier: string
    name: string
    objectType: string
    relation: string
    description: string
    index: string
    status: string
    depth: string
    mimeType: string
    visibility: string
    compatibilityLevel: string
  }

  export interface IDependentContent {
    identifier: string
    name: string
    objectType: string
    relation: string
    description: string
    index: string
    status: string
    depth: string
    mimeType: string
    visibility: string
    compatibilityLevel: string
  }
}

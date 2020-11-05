export interface IReleaseNotes {
  releaseList: IReleaseType[]
}

export interface IReleaseType {
  releaseVersion: string
  releaseDate: string
  items: IReleaseItems[]
}

export interface IReleaseItems {
  releaseCategory: 'ADDED' | 'BUG_FIX' | 'CHANGED'
  releaseNote: string
}

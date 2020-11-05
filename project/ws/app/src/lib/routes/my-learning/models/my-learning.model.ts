export namespace NSLearningData {
  export interface ILearningDetails {
    role_status: {
      banner_image: string
      last_updated: string
      role_name: string
      progress: number
      course_count: number
      course_completed: number
      end_date: string
      start_date: string
      Certified: ILevelData[]
      Professional: ILevelData[]
      Master: ILevelData[]
    }
  }
  export interface ILevelData {
    content_id: string
    progress: number
  }
}

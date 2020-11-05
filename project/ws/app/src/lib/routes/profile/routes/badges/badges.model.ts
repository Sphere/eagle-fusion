export interface IBadgeResponse {
  canEarn: IBadge[]
  closeToEarning: IBadge[]
  earned: IBadgeRecent[]
  lastUpdatedDate: string
  recent: IBadgeRecent[]
  totalPoints: [
    {
      collaborative_points: number
      learning_points: number
    }
  ]
}

export interface IBadge {
  Description: string
  BadgeName: string
  BadgeImagePath: string
  badge_group: string
  badge_id: string
  badge_name: string
  badge_order: string
  badge_type: 'O' | 'R'
  hover_text: string
  how_to_earn: string
  image: string
  is_new: number
  progress: number
  received_count: number
  threshold: number
}

export interface IBadgeRecent extends IBadge {
  first_received_date: string
  last_received_date: string
  message: string
  image: string
}

export interface IUserNotification {
  image: string
  badge_group: string
  is_new: number
  received_count: number
  badge_id: string
  how_to_earn: string
  progress: number
  threshold: number
  badge_type: string
  badge_name: string
  last_received_date: string
  first_received_date: string
  hover_text: string
  message: string
}

export interface IUserTotalPoints {
  learning_points: number
  collaborative_points: number
}

export interface IUserNotifications {
  totalPoints: IUserTotalPoints[]
  recent_badge: IUserNotification
}

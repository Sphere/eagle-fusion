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

export interface IUserNotificationsApiResponse {
  response: IUserNotifications
}

import { Component, OnDestroy, OnInit, Renderer2 } from "@angular/core"
import { SafeHtml } from "@angular/platform-browser"
import { Socket, io } from "socket.io-client"


import { Router } from "@angular/router"

import { environment } from '../../../environments/environment'
import { Events } from "./events"
import { LocalStorageService } from "../../services/local-storage.service"
import {
  ConfigurationsService,
} from '@ws-widget/utils'
@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
})
export class NotificationsComponent implements OnInit, OnDestroy {

  dropdownContent = false;
  readNotificationList: any = [];
  unReadNotificationList: any = [];
  allNotificationList = [
    {
      status: "read",
      createdon: "2025-02-25T10:00:00Z",
      data: {
        actionData: {
          actionType: "course",
          identifier: "do_11413970065553817612",
          logo: "https://sunbirdcontent-stage.s3-ap-south-1.amazonaws.com/collection/do_11413970065553817612/artifact/do_11413970085802803213_1726037703072_do114064734579908608151716886545860certificate117168865445991726037701451.thumb.jpg",
          title: "New Course Available",
          description: "A new course on Advanced Cardiac Life Support is now available.",
        }
      }
    },
    {
      status: "read",
      createdon: "2025-02-24T15:30:00Z",
      data: {
        actionData: {
          actionType: "course",
          identifier: "do_11413970065553817612",
          logo: "https://sunbirdcontent-stage.s3-ap-south-1.amazonaws.com/collection/do_11413970065553817612/artifact/do_11413970085802803213_1726037703072_do114064734579908608151716886545860certificate117168865445991726037701451.thumb.jpg",
          title: "Course Updated",
          description: "The Oncology Nursing course has been updated with new modules.",
        }
      }
    },
    {
      status: "unread",
      createdon: "2025-02-23T08:45:00Z",
      data: {
        actionData: {
          actionType: "certificate",
          identifier: "do_11413970065553817612",
          logo: "https://sunbirdcontent-stage.s3-ap-south-1.amazonaws.com/collection/do_11413970065553817612/artifact/do_11413970085802803213_1726037703072_do114064734579908608151716886545860certificate117168865445991726037701451.thumb.jpg",
          title: "Upcoming Webinar",
          description: "Join our upcoming webinar on Postpartum Care this weekend.",
        }
      }
    },
    {
      status: "unread",
      createdon: "2025-02-22T12:00:00Z",
      data: {
        actionData: {
          actionType: "courseUpdate",
          identifier: "do_11342648503935795211688",
          logo: "https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_11342650365052518411699/artifact/do_11342650365052518411699_1638977496480_qw1638977496296.png",
          title: "Integrated Sexual and Reproductive Health (ISRH)",
          description: "Launched a new course",
        }
      }
    },
    {
      status: "unread",
      createdon: "2025-02-21T09:30:00Z",
      data: {
        actionData: {
          actionType: "certificateUpdate",
          identifier: "do_1134170689871134721450",
          logo: "https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1134170689871134721450/artifact/do_1134172312759009281507_1637848523570_normallabourandbirthalt1620746178335.thumb.png",
          title: "Normal Labour & Birth and AMTSL",
          description: "Congratulations! You have successfully completed the course",
        }
      }
    },
    {
      status: "unread",
      createdon: "2025-02-20T14:45:00Z",
      data: {
        actionData: {
          actionType: "courseUpdate",
          identifier: "do_113789659935694848169",
          logo: "https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1137914849112309761114/artifact/do_1137914849112309761114_1683530873281_combined1683530872216.png",
          title: "Infection Prevention",
          description: "New Course Added",
        }
      }
    },
    {
      status: "unread",
      createdon: "2025-02-19T17:20:00Z",
      data: {
        actionData: {
          actionType: "courseUpdate",
          identifier: "do_1134170690099118081470",
          logo: "https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1134172312759009281507/artifact/do_1134172312759009281507_1637848567343_fernandezfoundationprimarylogo20191599049077665.jpg",
          title: "Respectful Maternity Care (M1-S1-U4)",
          description: "Ram Kumar has commented on your post.",
        }
      }
    },
    {
      status: "unread",
      createdon: "2025-02-18T10:10:00Z",
      data: {
        actionData: {
          actionType: "courseUpdate",
          identifier: "do_1134941664409272321316",
          logo: "https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1135111184512696321759/artifact/do_1135111184512696321759_1649306451969_bf11649306451278.jpg",
          title: "Value Added Course on Lactation Counselor",
          description: "Upcoming course! ",
        }
      }
    },
    {
      status: "unread",
      createdon: "2025-02-17T11:55:00Z",
      data: {
        actionData: {
          actionType: "courseUpdate",
          identifier: "do_11357408383009587211503",
          logo: "https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_11357408383009587211503/artifact/do_1135050043459420161605_1648560100961_thumb1648560100111.thumb.png",
          title: "Implementing Respectful Maternity Care In Healthcare Facilities",
          description: "New Course Available ",
        }
      }
    }
  ];
  access_token = '';
  user_id = '';
  message!: SafeHtml
  image!: string
  socket!: Socket
  loader: any
  constructor(

    private events: Events,
    private storage: LocalStorageService,
    private router: Router,
    private renderer: Renderer2,
    public configSvc: ConfigurationsService,

  ) { }

  async ngOnInit() {
    await this.getAccessToken()
    this.getReadNotifications()
    if (!(this.socket && this.socket.connected)) {
      await this.connectSocket()
    }
    await this.getNotification()
  }

  openDailog() {
    this.dropdownContent = !this.dropdownContent
  }

  handleAction(message: string) {
    this.dropdownContent = !this.dropdownContent
    switch (message) {
      case 'read':
        if (this.unReadNotificationList.length) {
          this.socket.emit('markAllAsRead', { userId: this.user_id })
          this.unReadNotificationList = this.unReadNotificationList.map((elem) => ({ ...elem, status: 'read' }))
          this.readNotificationList = [...this.readNotificationList, ...this.unReadNotificationList]
          this.storage.setLocalStorage('readNotificationLists', { userId: this.user_id, notifications: this.readNotificationList })
          this.unReadNotificationList = []
          this.storage.setNumberOfNotifications(0)
          this.events.publish("notificationCountUpdated", 0)
          this.setAllNotificationList()
        }
        break
      case 'clear':
        this.allNotificationList = []
        if (this.readNotificationList.length) {
          this.readNotificationList = []
          this.storage.setLocalStorage('readNotificationLists', { userId: this.user_id, notifications: this.readNotificationList })
          this.storage.setNumberOfNotifications(0)
        }
        if (this.unReadNotificationList.length) {
          this.unReadNotificationList = []
          this.storage.setNumberOfNotifications(0)
        }
        this.events.publish("notificationCountUpdated", 0)
        break
      default:
        break
    }
  }

  async getAccessToken() {
    const loginData = localStorage.getItem('loginDetailsWithToken')
    if (loginData) {
      const parsedData = JSON.parse(loginData)
      let token = parsedData.token?.access_token
      console.log("token", token)
      // return token
      return 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkelFFNjdiRmxRN0V2eUF3Tktndmk1X2ZQR0dsVUVKOGEyMnFlZ1R0TFU0In0.eyJqdGkiOiJmYzE1ZDg1Mi02NmUxLTRjYTUtYWM1YS1mYjA1Y2Q5NmQ0OTQiLCJleHAiOjE3NDMxNDY1NDksIm5iZiI6MCwiaWF0IjoxNzQwNTU0NTQ5LCJpc3MiOiJodHRwczovL2Fhc3RyaWthLXN0YWdlLnRhcmVudG8uY29tL2F1dGgvcmVhbG1zL3N1bmJpcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZjo5MDdiNWM2NC0xZDc5LTQ0ZGItYjNiNS1lYzEyOWQ1N2Y0MjE6OGVhYjM5NWQtNDZmNC00N2ZmLTkwYWYtOWQ1MWQ1MTI2ZmMzIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoicG9ydGFsIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiY2E4NjU0MzktMjgwZS00MzkxLTgyZGItYTUwMGE0MDBhM2ZjIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2FkbWluLWFhc3RyaWthLXN0YWdlLnRhcmVudG8uY29tIiwiaHR0cDovLzEyNy4wLjAuMTozMDAwIiwiaHR0cHM6Ly9hYXN0cmlrYS1zdGFnZS50YXJlbnRvLmNvbS8qIiwiaHR0cHM6L2NicC1hYXN0cmlrYS1zdGFnZS50YXJlbnRvLmNvbSIsImh0dHBzOi8vb3JnLWFhc3RyaWthLXN0YWdlLnRhcmVudG8uY29tIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiIiLCJuYW1lIjoiUHVibGlzaGVyIFVzZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJwdWJsaXNoZXJ1c2VyX201cXMiLCJnaXZlbl9uYW1lIjoiUHVibGlzaGVyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwiZW1haWwiOiJwdSoqKioqKioqKipAeW9wbWFpbC5jb20ifQ.fL1p9vJetVOK4DRGPo8wJtrzJcJf5MVmatcUGdVMSEu0IZ2zfr5X-kVk4RSqqmLG00ApY5_fcYb6EWrUVScU9BwWBJdfPl0Xbhk4eQwRnfoM13_ab64v02rAcUL-U3yuwyaMnBn9Cfbij1kb0M2wnWjW0EAyV9lSuQ65yzShIVXjaRmfGhqVkuq_TyoKrnr2xKlzCUPfeQcDIApD-pqxa6DSuhS1Gu1qgIKoAvZx6MPtQoLiauMa-s_I51_2c2Gmo960G0HCy3EluE62ulUXqUVpfyLFvzSIgWD545bXBd6fycVzNenbIeNDTAdI_hwKM9ixKQB6PCy-NZdV2gfdRQ'
    }
    return ''
  }

  async getNotification() {
    this.socket.emit('getNotifications', { userId: this.user_id })
    this.socket.on('notificationsData', async (data) => {
      try {
        this.storage.setNumberOfNotifications(data?.notificationData?.length)
        this.events.publish("notificationCountUpdated", data?.notificationData?.length)
        const notifications: [] = data.notificationData.map((e: any) => {
          e.data = JSON.parse(e.data)
          return e
        })
        this.unReadNotificationList = notifications
        if (this.loader) {
          await this.loader.dismiss()
        }
      } catch (error) {
        if (this.loader) {
          await this.loader.dismiss()
        }
      }
      this.setAllNotificationList()
    })
  }

  getReadNotifications() {
    this.storage.getLocalStorage('readNotificationLists').then(
      (data) => {
        if (data && data.notifications && data.userId === this.user_id) {
          this.readNotificationList = data.notifications
        }
      })
  }

  getNotificationTime(createdOn) {
    let createdDate = new Date(createdOn)
    let currentDate = new Date()
    let timeDifference: number = currentDate.getTime() - createdDate.getTime()
    const oneDay = 24 * 60 * 60 * 1000
    const oneHour = 60 * 60 * 1000
    const oneMinute = 60 * 1000
    const days = Math.floor(timeDifference / oneDay)
    const hours = Math.floor((timeDifference % oneDay) / oneHour)
    const minute = Math.floor((timeDifference % oneHour) / oneMinute)
    const time = (days > 0 ? `${days}d` : (hours > 0 ? `${hours}hr` : `${minute}mins`))
    return time
  }

  async connectSocket() {
    const url = `wss://${environment.sitePath}`;;
    const token = this.access_token ? this.access_token : await this.getAccessToken()
    this.socket = io(url, {
      auth: { token },
      path: '/apis/socket.io/'
    })
    this.socket.on('connect', () => {
      console.log(`Connected to the server with ID: ${this.socket.id}`)
    })

  }

  async readNotification(item: any) {
    if (!this.socket || !this.socket.connected) {
      await this.connectSocket()
    }
    if (item.status === 'read') {
      this.notificationAction(item)
      return
    }
    this.socket.emit('markAsRead', { notificationId: item.id, userId: this.user_id })
    // update locally
    this.storage.setNumberOfNotifications(this.unReadNotificationList.length - 1)
    this.events.publish("notificationCountUpdated", this.unReadNotificationList.length - 1)

    this.readNotificationList.push({ ...item, status: 'read' })
    this.storage.setLocalStorage('readNotificationLists', { userId: this.user_id, notifications: this.readNotificationList })
    this.unReadNotificationList = this.unReadNotificationList.filter((elem) => elem.id !== item.id)
    this.setAllNotificationList()
    await this.notificationAction(item)
  }

  async notificationAction(item: any) {
    if (this.dropdownContent) {
      this.closeDailog()
    }
    if (item.data && item.data.actionData) {
      if (item.data.actionData.actionType.includes('course') || item.data.actionData.actionType.includes('certificate')) {
        let url = `/app/toc/` + `${item.data.actionData.identifier}` + `/overview`
        this.router.navigate([url], { replaceUrl: true })
      } else if (item.data.actionData.actionType.includes('other')) {
        // navigation for other actions
      }
    }
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect()
      console.log('Socket disconnected')
    }
  }

  async deleteNotification(item: any) {
    if (item?.status === 'read') {
      this.readNotificationList = this.readNotificationList.filter((ele) => ele.id !== item.id)
      this.storage.setLocalStorage('readNotificationLists', { userId: this.user_id, notifications: this.readNotificationList })
    } else {
      this.unReadNotificationList = this.unReadNotificationList.filter((ele) => ele.id !== item.id)
      this.socket.emit('markAsRead', { notificationId: item.id, userId: this.user_id })
      this.events.publish("notificationCountUpdated", this.unReadNotificationList.length - 1)
    }
    this.setAllNotificationList()
  }

  setAllNotificationList() {
    if (this.readNotificationList.length || this.unReadNotificationList.length) {
      this.allNotificationList = [...this.readNotificationList, ...this.unReadNotificationList]
      this.allNotificationList.sort((a, b) => new Date(b.createdon).getTime() - new Date(a.createdon).getTime())
      return
    }
  }

  ngAfterViewInit() {
    this.renderer.listen('document', 'click', (_event: Event) => {
      // if (this.slidingItem) {
      //   this.slidingItem.closeOpened()
      // }
    })
  }

  closeDailog() {
    if (this.dropdownContent) {
      this.dropdownContent = false
    }
  }

}

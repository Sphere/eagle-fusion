import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class HeaderServiceService {
  isSavePressed = true

  headerSaveData: Subject<boolean> = new Subject<boolean>()
  showCourseHeader: Subject<any> = new Subject<any>()

  constructor()  {
      this.headerSaveData.subscribe(value => {
          this.isSavePressed = value
      })
      // this.showCourseHeader.subscribe(value => {
      //   // console.log('value==>', value)
      // })
  }

  saveCourseContent() {
      this.headerSaveData.next(this.isSavePressed)
      // tslint:disable-next-line:no-console
      console.log('this.headerSaveData', this.headerSaveData)
  }

  showCreatorHeader(name: string) {
    if (name !== 'showlogo') {
    const courseName = name || 'Course Name'
    this.showCourseHeader.next(courseName)
    } else {
      this.showCourseHeader.next('')
    }
  }
}

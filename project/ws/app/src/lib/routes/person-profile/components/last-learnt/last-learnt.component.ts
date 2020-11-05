import { Component, OnInit } from '@angular/core'
import { PersonProfileService } from '../../services/person-profile.service'
import { NsContent } from '../../../../../../../../../library/ws-widget/collection/src/public-api'
export interface IFilteredContent {
  contentType: string,
  contents: NsContent.IContent[]
}
@Component({
  selector: 'ws-app-last-learnt',
  templateUrl: './last-learnt.component.html',
  styleUrls: ['./last-learnt.component.scss'],
})

export class LastLearntComponent implements OnInit {

  lastLearntContent: NsContent.IContent[] = []
  filteredContent: IFilteredContent[] = []
  contentTypes = ['course', 'collection', 'resource']

  constructor(private profileSvc: PersonProfileService) { }

  ngOnInit() {
    this.profileSvc.lastlearnt().subscribe((data: any) => {
      this.filterLastLearntContent(data.contents)

    })

  }

  filterLastLearntContent(lastViewed: NsContent.IContent[]) {
    this.lastLearntContent = lastViewed
    this.contentTypes.forEach(arrayContentType => {
      const filteredContent: IFilteredContent = {
        contentType: arrayContentType,
        contents: [],
      }
      this.lastLearntContent.forEach(content => {
        if (content.contentType.toLowerCase() === arrayContentType) {
          filteredContent.contents.push(content)
        }
      })
      this.filteredContent.push(filteredContent)
    })
  }

}

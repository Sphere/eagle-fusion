import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

interface ITabs {
  name: string
  image: string
  style: {}
}

@Component({
  selector: 'ws-app-industry',
  templateUrl: './industry.component.html',
  styleUrls: ['./industry.component.scss'],
})
export class IndustryComponent implements OnInit {
  industriesData = this.route.snapshot.data.pageData.data
  tabNames: string[] = []
  defaultThumbnail = '/assets/images/missing-thumbnail.png'
  tabs: ITabs[] = []
  styles = [{}]

  constructor(
    private route: ActivatedRoute,
  ) {
    this.tabNames = Object.keys(this.industriesData)

    const styler = {
      color: 'white',
      'background-image': `url(${this.defaultThumbnail})`,
      'grid-column-start': 1,
      'grid-column-end': 3,
    }
    const style2 = {
      color: 'white',
      'background-image': `url(${this.defaultThumbnail})`,
      'grid-row-start': 3,
      'grid-row-end': 5,
    }

    this.styles.push(styler)
    this.styles.push(style2)

    let count = 0
    this.tabNames.forEach(tab => {
      const data: ITabs = {
        name: tab,
        image: this.defaultThumbnail,
        style: this.styles[count],
      }
      this.tabs.push(data)
      count += 1
    })
  }

  ngOnInit() { }
}

import { Component, OnInit, Input } from '@angular/core'
import { IWsLeaderArticle } from '../../model/leadership.model'

@Component({
  selector: 'ws-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss'],
})
export class ArticlesComponent implements OnInit {
  @Input() articles: IWsLeaderArticle[] = []

  constructor() {}

  ngOnInit() {}
}

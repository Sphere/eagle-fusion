import { Component, OnInit } from '@angular/core'
import { Data, ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-app-forum-edit',
  templateUrl: './forum-edit.component.html',
  styleUrls: ['./forum-edit.component.scss'],
})
export class ForumEditComponent implements OnInit {

  constructor(
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe((_result: Data) => {
    })
  }

}

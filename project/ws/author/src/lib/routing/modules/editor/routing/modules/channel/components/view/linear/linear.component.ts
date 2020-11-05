import { IWidgetAuthor } from './../../../interface/widget'
import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { ChannelStoreService } from './../../../services/store.service'

@Component({
  selector: 'ws-auth-linear',
  templateUrl: './linear.component.html',
  styleUrls: ['./linear.component.scss'],
})
export class LinearComponent implements OnInit, OnChanges {

  @Input() id = ''
  @Input() isSubmitPressed = false
  widget!: IWidgetAuthor

  constructor(
    private store: ChannelStoreService,
  ) { }

  ngOnChanges() {
    this.initiate()
  }

  ngOnInit() {
    this.store.update.subscribe(
      (id: string) => {
        if (id === this.id) {
          this.initiate()
        }
      },
    )
  }

  initiate() {
    this.widget = this.store.getUpdatedContent(this.id)
  }

}

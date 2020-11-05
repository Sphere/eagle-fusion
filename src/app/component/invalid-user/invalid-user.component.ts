import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-invalid-user',
  templateUrl: './invalid-user.component.html',
  styleUrls: ['./invalid-user.component.scss'],
})
export class InvalidUserComponent implements OnInit, OnDestroy {
  private subscriptionData: Subscription | null = null
  invalidData = ''
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.subscriptionData = this.route.data.subscribe(data => {
      this.invalidData = data.pageData.data.value
    })
  }

  ngOnDestroy() {
    if (this.subscriptionData) {
      this.subscriptionData.unsubscribe()
    }
  }

}

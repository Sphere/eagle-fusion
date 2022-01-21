import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-google-callback',
  templateUrl: './google-callback.component.html',
  styleUrls: ['./google-callback.component.scss'],
})
export class GoogleCallbackComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.navigate(['/page/home'])
  }

}

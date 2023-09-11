import { Component, OnInit } from '@angular/core'
@Component({
  selector: 'ws-mobile-testimonials',
  templateUrl: './mobile-testimonials.component.html',
  styleUrls: ['./mobile-testimonials.component.scss'],
})
export class MobileTestimonialsComponent implements OnInit {
  name = 'Angular';
  isActive = 1;
  constructor() { }

  ngOnInit() {
  }

  next() {
    if (this.isActive == 3) this.isActive = 0
    this.isActive++
  }
  pre() {
    this.isActive--
    if (this.isActive == 0) this.isActive = 3
  }

}

import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ws-proficiency-landing',
  templateUrl: './proficiency-landing.component.html',
  styleUrls: ['./proficiency-landing.component.scss']
})
export class ProficiencyLandingComponent implements OnInit {

  profeciencyData = [{
    title: "Understands HCM guidelines",
    minutes: '11',
    questions: '7'
  },
  {
    title: "Lists raw material required",
    minutes: '4',
    questions: '3'
  },
  ]
  constructor() { }

  ngOnInit() {
  }



}

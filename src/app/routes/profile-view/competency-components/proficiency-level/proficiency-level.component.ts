import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'ws-proficiency-level',
  templateUrl: './proficiency-level.component.html',
  styleUrls: ['./proficiency-level.component.scss']
})
export class ProficiencyLevelComponent implements OnInit {

  @Input() proficiency: any
  constructor() { }

  ngOnInit() {
  }

}

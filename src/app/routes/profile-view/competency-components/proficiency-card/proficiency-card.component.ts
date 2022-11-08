import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'ws-proficiency-card',
  templateUrl: './proficiency-card.component.html',
  styleUrls: ['./proficiency-card.component.scss']
})
export class ProficiencyCardComponent implements OnInit {

  @Input() cardData: any
  constructor() { }

  ngOnInit() {
  }

}

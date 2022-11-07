import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'ws-competency-card',
  templateUrl: './competency-card.component.html',
  styleUrls: ['./competency-card.component.scss']
})
export class CompetencyCardComponent implements OnInit {

  @Input() cardData: any

  actionBtn = true;
  proficiency = 'Self assessment';

  constructor() { }

  ngOnInit() {
  }

}

import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-competency-card',
  templateUrl: './competency-card.component.html',
  styleUrls: ['./competency-card.component.scss']
})
export class CompetencyCardComponent implements OnInit {

  @Input() cardData: any

  actionBtn = true;
  proficiency = 'Self assessment';

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  startCompetency() {
    this.router.navigateByUrl("user/competency/proficiency")
  }

}

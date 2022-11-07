import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { CompetencyService } from '../../../../services/competency.service'

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
    private competencyService: CompetencyService
  ) { }

  ngOnInit() {
  }

  startCompetency() {
    if (this.cardData) {
      this.competencyService.pushCompetencyData(this.cardData)
      this.router.navigateByUrl('user/competency/proficiency')
    }
  }

}

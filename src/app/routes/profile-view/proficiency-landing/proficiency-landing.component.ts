import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { CompetencyService } from '../../../services/competency.service'

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
  CompetencyData: any

  constructor(
    private router: Router,
    private competencyService: CompetencyService
  ) {
    this.CompetencyData = this.competencyService.getCompetencyData
    if (!this.CompetencyData) {
      this.router.navigateByUrl('user/competency')
    }
  }

  ngOnInit() {
  }



}

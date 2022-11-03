import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'ws-competency-card',
  templateUrl: './competency-card.component.html',
  styleUrls: ['./competency-card.component.scss']
})
export class CompetencyCardComponent implements OnInit {

  @Input() competency = {
    title: 'Procurement and Distribution of HCM',
    description: 'Manages procurement and store raw materials for HCMs as per the pre-decided menu Supervises the preparation and distribution of HCM by Anganwadi Helper (AWH)',
    proficency: [{
    }]
  }

  showButton = true;
  proficiency = 'Self assessment';

  constructor() { }

  ngOnInit() {
  }

}

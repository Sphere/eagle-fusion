import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ws-competencies',
  templateUrl: './competencies.component.html',
  styleUrls: ['./competencies.component.scss']
})
export class CompetenciesComponent implements OnInit {


  competencyData = [
    {
      title: 'Procurement and Distribution of HCM',
      description: 'Manages procurement and store raw materials for HCMs as per the pre-decided menu Supervises the preparation and distribution of HCM by Anganwadi Helper (AWH)',
      proficency: [
        {
          level: 1,
          selected: true,
        },
        {
          level: 2,
          selected: true,
        },
        {
          level: 3,
          selected: true,
        },
        {
          level: 4,
          selected: true,
        },
        {
          level: 5,
          selected: false,
        },
      ]
    },
    {
      title: 'Early Childhood Care Education',
      description: 'Mobilizes children and conducts ECCE activities as per the yearly activity calendar and the ECCE manual ',
      proficency: [
        {
          level: 1,
          selected: true,
        },
        {
          level: 2,
          selected: true,
        },
        {
          level: 3,
          selected: true,
        },
        {
          level: 4,
          selected: true,
        },
        {
          level: 5,
          selected: false,
        },
      ]
    }
  ]
  gainedproficencyData = [
    {
      title: 'Sector Meetings',
      description: 'Documents and discuss HCM, THR, growth monitoring and referral related issues in sector meetings',
      proficency: [
        {
          level: 1,
          selected: true,
          gained: false
        },
        {
          level: 2,
          selected: true,
          gained: false
        },
        {
          level: 3,
          selected: true,
          gained: false
        },
        {
          level: 4,
          selected: true,
          gained: true
        },
        {
          level: 5,
          selected: false,
          gained: false
        },
      ],
      proficencySource: 'Self assessment'
    },
    {
      title: 'Counselling ',
      description: 'Lorem ipsum dolor sit amet, consectetur',
      proficency: [
        {
          level: 1,
          selected: false,
          gained: false
        },
        {
          level: 2,
          selected: false,
          gained: false
        },
        {
          level: 3,
          selected: false,
          gained: false
        },
        {
          level: 4,
          selected: false,
          gained: true
        },
        {
          level: 5,
          selected: false,
          gained: false
        },
      ],
      proficencySource: 'Course Completion'
    }
  ]


  constructor() { }

  ngOnInit() {
  }



}

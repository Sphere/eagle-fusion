import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ROOT_WIDGET_CONFIG } from '@ws-widget/collection'
import { TFetchStatus } from '@ws-widget/utils'
import { Chart } from 'chart.js'
import { NSProfileData } from '../../../../models/profile.model'
import { NSCompetency } from '../../models/competency.model'
import { AssessmentService } from '../../services/competency.service'

@Component({
  selector: 'ws-app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent implements OnInit {
  lineChart: Chart | null = null
  assessmentData: any
  assessmentDetails: NSCompetency.IAchievementsRes | null = null
  endDate = `${new Date().getFullYear()}-${`0${new Date().getMonth() + 1}`.slice(-2)}-${`0${new Date().getDate()}`.slice(-2)}`
  apiFetchStatus: TFetchStatus = 'fetching'
  orgWideGraph: NSProfileData.IGraphWidget = {} as NSProfileData.IGraphWidget
  constructor(private route: ActivatedRoute, private assessSvc: AssessmentService) { }

  ngOnInit() {
    const typeParam: string = this.route.snapshot.queryParamMap.get('type') || ''
    const idParam: string = this.route.snapshot.queryParamMap.get('id') || ''
    this.apiFetchStatus = 'fetching'
    if (typeParam === 'assessment') {
      this.assessSvc.getDetails('2018-04-01', this.endDate).subscribe(
        (data: NSCompetency.IAchievementsRes) => {
          this.assessmentDetails = data
          this.assessmentData = data.assessments
          if (this.assessmentData) {
            this.assessmentData = this.assessmentData.filter((assess: NSCompetency.ICompetency) => assess.id === idParam)
            this.getGraphData(this.assessmentData[0])
          }
          this.apiFetchStatus = 'done'
        },
        () => {
          this.apiFetchStatus = 'error'
        },
      )
    }
    // if (this.assessmentDetails) {
    //   // //console.log('val:', this.assessmentDetails.scoreDistribution['0.0-25.0'])
    // }

    // this.lineChart = new Chart('canvas', {
    //   type: 'line',
    //   data: {
    //     labels: ['0', '25', '50', '75', '100'],
    //     datasets: [
    //       {
    //         data: this.assessmentDetails.scoreDistribution[0],
    //         label: '0-25',
    //         backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //         borderColor: 'rgba(255, 99, 132, 1)',
    //         borderWidth: 3,
    //         lineTension: 0,
    //         fill: true,
    //       },
    //       {
    //         data: this.assessmentDetails.scoreDistribution[1],
    //         backgroundColor: 'rgba(54, 162, 235, 0.2)',
    //         borderColor: 'rgba(54, 162, 235, 1)',
    //         borderWidth: 3,
    //         label: '25-50',
    //         lineTension: 0,
    //         fill: true,
    //       },
    //       {
    //         data: this.assessmentDetails.scoreDistribution[2],
    //         backgroundColor: 'rgba(255, 206, 86, 0.2)',
    //         borderColor: 'rgba(255, 206, 86, 1)',
    //         borderWidth: 3,
    //         label: '50-75',
    //         lineTension: 0,
    //         fill: true,
    //       },
    //       {
    //         data: this.assessmentDetails.scoreDistribution[3],
    //         backgroundColor: 'rgba(75, 192, 192, 0.2)',
    //         borderColor: 'rgba(75, 192, 192, 1)',
    //         borderWidth: 3,
    //         label: '75-10',
    //         lineTension: 0,
    //         fill: true,
    //       },
    //     ],
    //   },
    //   options: {
    //     scales: {
    //       yAxes: [
    //         {
    //           ticks: {
    //             beginAtZero: true,
    //           },
    //         },
    //       ],
    //     },
    //   },
    // })
  }
  getGraphData(assessmentData: any) {
    this.orgWideGraph = {
      widgetType: ROOT_WIDGET_CONFIG.graph._type,
      widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
      widgetData: {
        graphId: 'expandChart',
        graphType: 'line',
        graphHeight: '300px',
        graphWidth: '100%',
        graphLegend: false,
        graphLegendPosition: 'top',
        graphLegendFontSize: 11,
        graphTicksFontSize: 11,
        graphTicksXAxisDisplay: false,
        graphTicksYAxisDisplay: true,
        graphGridLinesDisplay: false,
        graphDefaultPalette: 'default',
        graphData: {
          labels: ['0', '25', '50', '75', '100'],
          datasets: [
            {
              data: assessmentData.scoreDistribution['0.0-25.0'],
              label: '0-25',
              backgroundColor: ['rgba(255, 99, 132, 0.2)'],
              borderColor: ['rgba(255, 99, 132, 1)'],
              borderWidth: 3,
              lineTension: 0,
              fill: true,
            },
            {
              data: assessmentData.scoreDistribution['25.0-50.0'],
              backgroundColor: ['rgba(54, 162, 235, 0.2)'],
              borderColor: ['rgba(54, 162, 235, 1)'],
              borderWidth: 3,
              label: '25-50',
              lineTension: 0,
              fill: true,
            },
            {
              data: assessmentData.scoreDistribution['50.0-75.0'],
              backgroundColor: ['rgba(255, 206, 86, 0.2)'],
              borderColor: ['rgba(255, 206, 86, 1)'],
              borderWidth: 3,
              label: '50-75',
              lineTension: 0,
              fill: true,
            },
            {
              data: assessmentData.scoreDistribution['75.0                            111 -100.0'],
              backgroundColor: ['rgba(75, 192, 192, 0.2)'],
              borderColor: ['rgba(75, 192, 192, 1)'],
              borderWidth: 3,
              label: '75-10',
              lineTension: 0,
              fill: true,
            },
          ],
        },
      },
    }
    this.lineChart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: ['0', '25', '50', '75', '100'],
        datasets: [
          {
            data: assessmentData.scoreDistribution['0.0-25.0'],
            label: '0-25',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 3,
            lineTension: 0,
            fill: true,
          },
          {
            data: assessmentData.scoreDistribution['25.0-50.0'],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 3,
            label: '25-50',
            lineTension: 0,
            fill: true,
          },
          {
            data: assessmentData.scoreDistribution['50.0-75.0'],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 3,
            label: '50-75',
            lineTension: 0,
            fill: true,
          },
          {
            data: assessmentData.scoreDistribution['75.0-100.0'],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 3,
            label: '75-10',
            lineTension: 0,
            fill: true,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    })
  }
}

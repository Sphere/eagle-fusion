import { Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core'
import { Chart } from 'chart.js'
@Component({
  selector: 'ws-app-bubble-chart',
  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.scss'],
})
export class BubbleChartComponent implements OnInit, AfterViewInit, OnDestroy {
  bubbleChart: Chart | null = null
  @Input() bubbleData: any
  @Input() mainTitle!: string
  @Input() height!: string
  @Input() weight!: string
  @Input() startDate!: string
  @Input() endDate!: string
  @Input() bubbleChartLabels!: string[]
  trackWiseLabels: string[] = []
  @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef<HTMLDivElement> | null = null
  popData: any
  yearStart!: string
  yearEnd!: string
  options: any
  constructor() {
  }

  ngOnInit() {
    this.popData = {
      datasets: [
        {
          label: 'Time Spent',
          data: this.bubbleData,

          backgroundColor: [
            '#6F1E51',
            '#EA2027',
            '#F79F1F',
            '#EE5A24',
            '#009432',
            '#006266',
            '#6F1E51',
            '#D980FA',
            '#1289A7',
            '#A3CB38',
            '#009432',
            '#9980FA',
            '#F79F1F',
            '#EE5A24',
            '#009432',
            '#006266)',
            '#6F1E51',
            '#9980FA',
            '#F79F1F',
            '#EE5A24',
            '#6F1E51',
            '#EA2027',
            '#F79F1F',
            '#EE5A24',
            '#009432',
            '#006266',
            '#6F1E51',
            '#D980FA',
            '#1289A7',
            '#A3CB38',
            '#009432',
            '#9980FA',
            '#F79F1F',
            '#EE5A24',
            '#009432',
            '#006266)',
            '#6F1E51',
            '#9980FA',
            '#F79F1F',
            '#EE5A24',
            '#6F1E51',
            '#EA2027',
            '#F79F1F',
            '#EE5A24',
            '#009432',
            '#006266',
            '#6F1E51',
            '#D980FA',
            '#1289A7',
            '#A3CB38',
            '#009432',
            '#9980FA',
            '#F79F1F',
            '#EE5A24',
            '#009432',
            '#006266)',
            '#6F1E51',
            '#9980FA',
            '#F79F1F',
            '#EE5A24',
            '#6F1E51',
            '#EA2027',
            '#F79F1F',
            '#EE5A24',
            '#009432',
            '#006266',
            '#6F1E51',
            '#D980FA',
            '#1289A7',
            '#A3CB38',
            '#009432',
            '#9980FA',
            '#F79F1F',
            '#EE5A24',
            '#009432',
            '#006266)',
            '#6F1E51',
            '#9980FA',
            '#F79F1F',
            '#EE5A24',
          ],
        },
      ],
      // tslint:disable-next-line:max-line-length
      value: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    }
  }
  ngAfterViewInit() {
    this.initGraph()
  }

  initGraph() {
    const dateStartYear = this.startDate.split('-')[0]
    let yearEnd = ''
    let yearStart = ''
    const dateStart = this.startDate.split('-')[1]
    if (dateStart !== '01') {
      if (dateStartYear === '2018') {
        yearStart = '2018'
        yearEnd = '2019'
      } else {
        yearStart = '2019'
        yearEnd = '2020'
      }
    } else {
      if (dateStartYear === '2019') {
        yearStart = '2018'
        yearEnd = '2019'
      } else {
        yearStart = '2019'
        yearEnd = '2020'
      }
    }
    const today = new Date()
    // tslint:disable-next-line:max-line-length
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const firstHalf = month.slice(0, currentMonth + 1)
    const secondHalf = month.slice((currentMonth - 1), 12)
    const currentMonthArray: string[] = []
    const previousMonthArray: string[] = []

    firstHalf.map((mon: string) => {
      // tslint:disable-next-line:no-parameter-reassignment
      mon = `${mon}_${currentYear}`
      currentMonthArray.push(mon)
    })
    secondHalf.map((mon: string) => {
      // tslint:disable-next-line:no-parameter-reassignment
      mon = `${mon}_${currentYear - 1}`
      previousMonthArray.push(mon)
    })
    this.trackWiseLabels = previousMonthArray.concat(currentMonthArray)
    const canvas = document.createElement('canvas')
    canvas.id = 'trackWise'
    if (this.chartContainer) {
      this.chartContainer.nativeElement.appendChild(canvas)
    }
    this.bubbleChart = new Chart('trackWise', {
      type: 'bubble',

      data: this.popData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        hover: {
          mode: 'index',
        },
        scales: {
          xAxes: [
            {
              // type: 'time',
              // time: {
              //   unit: 'month',
              //   displayFormats: {
              //       quarter: 'MMM YYYY'
              //   }
              // },
              ticks: {
                // callback: function(value, index, data) {
                //   return  (value <= 12 ) ? value: '';
                // },

                callback(value) {
                  return (
                    `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    [value > 12 ? +value - 13 : +value - 1]}${(value > 12 ? yearEnd : yearStart)}`
                  )
                },

                source: 'labels',
                beginAtZero: false,
                max: 16,
                stepSize: 1,
                suggestedMin: 4,
              },
              scaleLabel: {
                display: true,
                labelString: 'Months',
              },
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: false,
              },
              scaleLabel: {
                display: true,
                labelString: '# of courses',
              },

              display: true,
              ticks: {
                beginAtZero: true,

                max: 4,
                stepSize: 1,
              },
            },
          ],
        },
        tooltips: {
          callbacks: {
            label(tooltipItem: any, data: any) {
              let label = data.datasets[tooltipItem.datasetIndex].label || ''
              if (label) {
                label += ' : '
              }
              // tslint:disable-next-line:max-line-length
              label += `in ${data.value[Math.floor(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x) - 1]} on ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].text} is ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].actual.toFixed(2)} mins`
              return label
            },
          },
        },
      },
    })
  }
  ngOnDestroy() {
    if (this.bubbleChart) {
      this.bubbleChart.destroy()
    }
  }
}

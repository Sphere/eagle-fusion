import { Component, Input, AfterViewInit } from '@angular/core'
import { ICounterPlotData } from '../../models/counter.model'

@Component({
  selector: 'ws-app-counter-entity',
  templateUrl: './counter-entity.component.html',
  styleUrls: ['./counter-entity.component.scss'],
})
export class CounterEntityComponent implements AfterViewInit {
  @Input()
  counterEntityPlot!: ICounterPlotData
  constructor() { }

  ngAfterViewInit() {
    if (this.counterEntityPlot) {
      // this.initializeChart()
    }
  }

  // initializeChart() {
  //   const ctx = (document.getElementById(this.counterEntityPlot.meta.chartId) as HTMLCanvasElement).getContext('2d')
  //   if (ctx) {
  //     new Chart(ctx, {
  //       type: this.counterEntityPlot.meta.graphType,
  //       data: {
  //         labels: this.counterEntityPlot.data.map(
  //           obj => new Date(obj.time).getHours() + ':' + new Date(obj.time).getMinutes(),
  //         ),
  //         datasets: [
  //           {
  //             label: this.counterEntityPlot.meta.graphLabel,
  //             data: this.counterEntityPlot.data.map(obj => obj.count),
  //             fill: false,
  //             borderColor: this.counterEntityPlot.meta.borderColor,
  //             borderWidth: 1.2,
  //             lineTension: 0.4,
  //             pointStyle: 'circle',
  //             pointRadius: 1.8,
  //             pointHoverRadius: 3.6,
  //             pointHitRadius: 4,
  //           },
  //         ],
  //       },
  //       options: {
  //         responsive: true,
  //         scales: {
  //           xAxes: [
  //             {
  //               scaleLabel: {
  //                 display: true,
  //                 labelString: this.counterEntityPlot.meta.xLabel,
  //               },
  //             },
  //           ],
  //           yAxes: [
  //             {
  //               scaleLabel: {
  //                 display: true,
  //                 labelString: this.counterEntityPlot.meta.yLabel,
  //               },
  //             },
  //           ],
  //         },
  //         layout: {
  //           padding: {
  //             left: 0,
  //           },
  //         },
  //         legend: {
  //           display: true,
  //         },
  //         title: {
  //           display: true,
  //           position: 'top',
  //           text: this.counterEntityPlot.meta.graphTitle,
  //         },
  //       },
  //     })
  //   }
  // }
}

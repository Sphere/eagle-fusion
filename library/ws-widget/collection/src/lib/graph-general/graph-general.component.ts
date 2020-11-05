import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { Chart, ChartOptions } from 'chart.js'
import { IWidgetGraphData, TChartJsGraphType, TChartJsColorPalette } from './graph-general.model'
import { COLOR_PALETTE, GRAPH_TYPES, colorPalettes } from './graph-general-color-palette'
import { GraphGeneralService } from './graph-general.service'
@Component({
  selector: 'ws-widget-graph-general',
  templateUrl: './graph-general.component.html',
  styleUrls: ['./graph-general.component.scss'],
})
export class GraphGeneralComponent extends WidgetBaseComponent
  implements
    OnInit,
    OnDestroy,
    AfterViewInit,
    OnChanges,
    NsWidgetResolver.IWidgetData<IWidgetGraphData> {
  @Input() widgetData!: IWidgetGraphData
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>
  generalChart: Chart | null = null
  customizeForm: FormGroup
  graphPalettes = COLOR_PALETTE
  itemObj: any
  graphTypes = GRAPH_TYPES
  graphDataType: TChartJsGraphType = ''
  graphPalette: TChartJsColorPalette = 'default'
  graphOptions = {}
  constructor(private _formBuilder: FormBuilder, private graphGeneralSvc: GraphGeneralService) {
    super()
    this.customizeForm = this._formBuilder.group({
      colorPalette: ['', Validators.required],
      graphType: ['', Validators.required],
    })
  }

  ngOnInit() {
    this.graphDataType = this.widgetData.graphType
    this.graphPalette = this.widgetData.graphDefaultPalette
    if (this.generalChart) {
      this.customizeGraph(this.graphPalette)
    }
  }

  ngOnChanges() {
    if (this.generalChart) {
      this.generalChart.update()
    }
  }

  ngAfterViewInit() {
    this.generateGraph(this.widgetData)
  }

  customizeGraph(palette: TChartJsColorPalette) {
    this.graphPalette =
      palette === undefined ? (this.graphPalette = 'default') : (this.graphPalette = palette)
    if (this.generalChart && this.generalChart.data && this.generalChart.data.datasets) {
      this.generalChart.data.datasets.forEach((dataGraph: any) => {
        dataGraph.backgroundColor = colorPalettes[this.graphPalette]
      })
      this.generalChart.update()
    }
  }
  customizeGraphType(type: TChartJsGraphType) {
    this.graphDataType =
      type === undefined ? (this.graphDataType = 'pie') : (this.graphDataType = type)
    this.ngOnDestroy()
    this.generateGraph(this.widgetData)
  }
  generateGraph(widgetData: IWidgetGraphData) {
    const canvas = document.createElement('canvas')
    if (widgetData != null) {
      canvas.id = widgetData.graphId
      const defaultOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          easing: 'easeInExpo',
        },
        scales: {
          xAxes: [
            {
              type: 'category',
              ticks: {
                display: widgetData.graphTicksXAxisDisplay,
                fontFamily: '\'Open Sans Bold\', sans-serif',
                fontSize: widgetData.graphTicksFontSize,
                max: widgetData.graphXAxisMax,
                stepSize: widgetData.graphXAxisStepSize,
                beginAtZero: true,
                callback: function (value: any) {
                  if (Math.floor(value) === value) {
                    return value
                  }
                }.bind(this),
              },
              gridLines: {
                drawBorder: true,
                display: widgetData.graphGridLinesDisplay,
              },
              scaleLabel: {
              display: widgetData.graphIsXAxisLabel,
              labelString: widgetData.graphXAxisLabel,
            },
              stacked: true,
            },
          ],
          yAxes: [
            {
              // type: 'category',
              gridLines: {
                display: widgetData.graphGridLinesDisplay,
              },
              ticks: {
                display: widgetData.graphTicksYAxisDisplay,
                fontFamily: '\'Open Sans Bold\', sans-serif',
                fontSize: widgetData.graphTicksFontSize,
                max: widgetData.graphYAxisMax,
                stepSize: widgetData.graphYAxisStepSize,
                beginAtZero: true,
                callback: function (value: any) {
                  if (value.length >= 12) {
                    return `${value.substring(0, 12)}...`
                  }
                  return value.substring(0, 12)
                }.bind(this),
              },
              scaleLabel: {
                display: widgetData.graphIsYAxisLabel,
                labelString: widgetData.graphYAxisLabel,
              },
              stacked: true,
            },
          ],
        },
        legend: {
          display: widgetData.graphLegend,
          position: widgetData.graphLegendPosition,
          labels: {
            fontColor: 'gray',
            fontSize: widgetData.graphLegendFontSize,
          },
        },
        elements: {
          rectangle: {
            borderSkipped: 'left',
          },
        },
      }
      this.chartContainer.nativeElement.appendChild(canvas)
      this.generalChart = new Chart(canvas.id, {
        type: this.graphDataType,
        data: { ...widgetData.graphData },
        options: this.getGraphOptions(widgetData.graphType, widgetData)
          ? this.getGraphOptions(widgetData.graphType, widgetData)
          : defaultOptions,
      })
    }
  }

  getGraphOptions(type: TChartJsGraphType, widgetData: IWidgetGraphData): ChartOptions | undefined {
    if (widgetData) {
      const scalesForX = {
        xAxes: [
          {
            type: 'category',
            ticks: {
              display: widgetData.graphTicksXAxisDisplay,
              fontFamily: '\'Open Sans Bold\', sans-serif',
              fontSize: widgetData.graphTicksFontSize,
              fontcolor: 'gray',
              max: widgetData.graphXAxisMax,
              autoSkip: widgetData.graphIsXAxisAutoSkip,
              maxTicksLimit: widgetData.graphXAxisMaxLimit,
              stepSize: widgetData.graphXAxisStepSize,
              maxRotation: 0,
              callback: function (value: any) {
                if (value.length >= 12) {
                  return `${value.substring(0, 12)}...`
                }
                return value.substring(0, 12)
              }.bind(this),
            },
            scaleLabel: {
              display: widgetData.graphIsXAxisLabel,
              labelString: widgetData.graphXAxisLabel,
            },
            gridLines: {
              drawBorder: true,
              display: widgetData.graphGridLinesDisplay,
            },
            stacked: true,
          },
        ],
        yAxes: [
          {
            // type: 'category',
            // barPercentage: 0.1,
            gridLines: {
              drawBorder: true,
              display: widgetData.graphGridLinesDisplay,
            },
            ticks: {
              display: widgetData.graphTicksYAxisDisplay,
              fontFamily: '\'Open Sans Bold\', sans-serif',
              fontSize: widgetData.graphTicksFontSize,
              fontcolor: 'gray',
              max: widgetData.graphYAxisMax,
              stepSize: widgetData.graphYAxisStepSize,
              beginAtZero: true,
              callback: function (value: any) {
                if (Math.floor(value) === value) {
                  return value
                }
              }.bind(this),
            },
            scaleLabel: {
              display: widgetData.graphIsYAxisLabel,
              labelString: widgetData.graphYAxisLabel,
            },
            stacked: true,
          },
        ],
      }
      const scalesForY = {
        xAxes: [
          {
            // type: 'category',
            ticks: {
              display: widgetData.graphTicksXAxisDisplay,
              fontFamily: '\'Open Sans Bold\', sans-serif',
              fontSize: widgetData.graphTicksFontSize,
              fontcolor: 'gray',
              beginAtZero: true,
              callback: function (value: any) {
                if (Math.floor(value) === value) {
                  return value
                }
              }.bind(this),
            },
            scaleLabel: {
              display: widgetData.graphIsXAxisLabel,
              labelString: widgetData.graphXAxisLabel,
            },
            gridLines: {
              drawBorder: true,
              display: widgetData.graphGridLinesDisplay,
            },
            stacked: true,
          },
        ],
        yAxes: [
          {
            // type: 'category',
            // barPercentage: 0.1,
            gridLines: {
              drawBorder: true,
              display: widgetData.graphGridLinesDisplay,
            },
            scaleLabel: {
              display: widgetData.graphIsYAxisLabel,
              labelString: widgetData.graphYAxisLabel,
            },
            ticks: {
              display: widgetData.graphTicksYAxisDisplay,
              fontFamily: '\'Open Sans Bold\', sans-serif',
              fontSize: widgetData.graphTicksFontSize,
              fontcolor: 'gray',
              beginAtZero: true,
              callback: function (value: any) {
                if (value.length >= 12) {
                  return `${value.substring(0, 12)}...`
                }
                return value.substring(0, 12)
              }.bind(this),
            },
            stacked: true,
          },
        ],
      }
      const optionsWithoutAxisClick = {
        maintainAspectRatio: false,
        legend: {
          display: widgetData.graphLegend,
          position: widgetData.graphLegendPosition,
          labels: {
            fontColor: 'gray',
            fontSize: widgetData.graphLegendFontSize,
          },
        },
        elements: {
          rectangle: {
            borderSkipped: 'left',
          },
        },
        // events: ['mouseup'],
        onHover: (event: any, chartElement: any) => {
          event.target.style.cursor = chartElement[0] ? 'pointer' : 'default'
        },
        onClick: (item: any, evt: any) => {
          this.itemObj = item
          this.graphGeneralSvc.updateFilterEvent(
            { filterName: evt[0]._chart.config.data.labels[evt[0]._index], filterType: widgetData.graphFilterType })
        },
      }
      const optionsWithoutAxisWithoutClick = {
        maintainAspectRatio: false,
        legend: {
          display: widgetData.graphLegend,
          position: widgetData.graphLegendPosition,
          labels: {
            fontColor: 'gray',
            fontSize: widgetData.graphLegendFontSize,
          },
        },
        elements: {
          rectangle: {
            borderSkipped: 'left',
          },
        },
      }
      const optionsWithoutAxis = widgetData.graphOnClick ? optionsWithoutAxisClick : optionsWithoutAxisWithoutClick
      const optionsForX = {
        ...optionsWithoutAxis,
        scales: scalesForX,
        tooltips: {
          callbacks: {
            label(tooltipItem: any, data: any) {
              let label = data.labels[tooltipItem.index] || ''
              if (label) {
                label += ' : '
              }
              label += data.datasets[0].data[tooltipItem.index]
              return label
            },
          },
        },
      }
      const optionsForY = {
        ...optionsWithoutAxis,
        scales: scalesForY,
        tooltips: {
          callbacks: {
            label(tooltipItem: any, data: any) {
              let label = data.labels[tooltipItem.index] || ''
              if (label) {
                label += ' : '
              }
              label += data.datasets[0].data[tooltipItem.index]
              return label
            },
          },
        },
      }
      switch (type) {
        case 'pie':
        case 'doughnut':
        case 'radar':
          return optionsWithoutAxis
        case 'horizontalBar':
          return optionsForY
        default:
          return optionsForX
      }
    }
    return undefined
  }

  ngOnDestroy() {
    if (this.generalChart) {
      this.generalChart.destroy()
    }
  }
}

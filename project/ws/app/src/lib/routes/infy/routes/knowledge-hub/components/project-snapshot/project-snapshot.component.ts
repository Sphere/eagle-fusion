import { Component, OnInit, Input } from '@angular/core'
import { IKhubProject, IItemsList, IProjectRisks } from '../../models/knowledgeHub.model'

@Component({
  selector: 'ws-app-infy-project-snapshot',
  templateUrl: './project-snapshot.component.html',
  styleUrls: ['./project-snapshot.component.scss'],
})
export class ProjectSnapshotComponent implements OnInit {
  @Input() projectDetails: IKhubProject = {} as IKhubProject
  @Input() isIntranet: boolean | null = null
  @Input() islargeScreen: boolean | null = null
  url = ''
  toolsRisksContributions: IItemsList[] = []
  constructor() { }

  ngOnInit() {
    this.url = `http://localhost:6789/view?source=promt&type=project&itemId=${
      this.projectDetails.itemId
      }&ref=home`
    this.projectDetails.mstBusinessContext =
      this.projectDetails.mstBusinessContext === null ? '' : this.projectDetails.mstBusinessContext
    this.projectDetails.mstInfosysRole =
      this.projectDetails.mstInfosysRole === null ? '' : this.projectDetails.mstInfosysRole
    this.projectDetails.mstInfyObjectives =
      this.projectDetails.mstInfyObjectives === null ? '' : this.projectDetails.mstInfyObjectives
    this.projectDetails.mstProjectScope =
      this.projectDetails.mstProjectScope === null ? '' : this.projectDetails.mstProjectScope
    this.projectDetails.risks.map((arr: IProjectRisks) => {
      if (arr.name === 'NA') {
        arr.description =
          arr.description.length > 50 ? `${arr.description.substring(0, 50)}...` : arr.description
        arr.name = `Risk - ${arr.id} : a${arr.description}`
      }
    })
    this.projectDetails.tools = this.projectDetails.tools.filter(tool => {
      return tool.name !== null
    })
    this.projectDetails.strategies = this.projectDetails.strategies.filter(strategy => {
      return strategy.name !== null
    })
    const str = this.projectDetails.contributions.length > 1 ? 's' : ''
    const str1 = this.projectDetails.tools.length > 1 ? 's' : ''
    this.toolsRisksContributions = [
      {
        data: this.projectDetails.contributions,
        type: 'contribution',
        itemsMinShown: 3,
        headingText: `Contribution${str}`,
      },
      // {
      //   data: this.projectDetails.risks,
      //   type: 'risk',
      //   itemsMinShown: 3,
      //   headingText:
      //     'References of Risk' +
      //     (this.projectDetails.risks.length > 1 ? 's' : '')
      // },
      // {
      //   data: this.projectDetails.strategies,
      //   type: 'strategy',
      //   itemsMinShown: 3,
      //   headingText:
      //     'Strateg' +
      //     (this.projectDetails.strategies.length > 1 ? 'ies' : 'y') +
      //     ' implemented'
      // },
      {
        data: this.projectDetails.tools,
        type: 'tool',
        itemsMinShown: 3,
        headingText: `Innovation${str1}`,
      },
    ]
  }
}

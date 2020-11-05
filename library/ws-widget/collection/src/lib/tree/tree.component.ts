import { Component, Input, OnChanges } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { IWsTree } from './tree.model'
import { NestedTreeControl } from '@angular/cdk/tree'
import { MatTreeNestedDataSource } from '@angular/material'

@Component({
  selector: 'ws-widget-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent extends WidgetBaseComponent
  implements OnChanges, NsWidgetResolver.IWidgetData<IWsTree[]> {
  @Input() widgetData!: IWsTree[]

  nestedTreeControl: NestedTreeControl<IWsTree>
  nestedDataSource: MatTreeNestedDataSource<IWsTree>

  hasNestedChild = (_: number, nodeData: IWsTree) =>
    nodeData && nodeData.children && nodeData.children.length

  private getChildren = (node: any) => {

    return node && node.children ? node.children : []
  }

  constructor() {
    super()
    this.nestedTreeControl = new NestedTreeControl<IWsTree>(this.getChildren)
    this.nestedDataSource = new MatTreeNestedDataSource()
  }

  ngOnChanges() {
    if (this.widgetData) {
      this.nestedDataSource.data = this.widgetData || []
    }
  }
}

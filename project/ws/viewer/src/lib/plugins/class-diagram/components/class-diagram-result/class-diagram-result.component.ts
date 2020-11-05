import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'viewer-class-diagram-result',
  templateUrl: './class-diagram-result.component.html',
  styleUrls: ['./class-diagram-result.component.scss'],
})
export class ClassDiagramResultComponent implements OnInit {

  @Input() result: any
  @Input() userData: any
  displayClassColumns: string[] = ['classname', 'access', 'attributes', 'methods', 'error']
  displayRelationColumns: string[] = ['relationship', 'result', 'error']
  constructor() { }

  ngOnInit() {
  }

}

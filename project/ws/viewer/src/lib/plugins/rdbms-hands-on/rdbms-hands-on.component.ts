import { Component, Input, OnChanges } from '@angular/core'

@Component({
  selector: 'viewer-plugin-rdbms-hands-on',
  templateUrl: './rdbms-hands-on.component.html',
  styleUrls: ['./rdbms-hands-on.component.scss'],
})
export class RdbmsHandsOnComponent implements OnChanges {
  @Input()
  processedContent: any
  constructor() { }

  ngOnChanges() {
    if (this.processedContent.content && this.processedContent.rdbms.problemStatement) {
      const artifactUrl = this.processedContent.content.artifactUrl
      const url = artifactUrl.substring(0, artifactUrl.lastIndexOf('/') + 1)
      const problem = this.processedContent.rdbms.problemStatement
      if (problem.includes(`src='`)) {
        const imageUrl = problem.substring(problem.indexOf(`src='`) + 5, problem.indexOf('assets'))
        this.processedContent.rdbms.problemStatement = this.processedContent.rdbms.problemStatement.replace(imageUrl, url)
      }
    }
  }

}

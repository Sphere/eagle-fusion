import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { LoggerService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'
import { groupCompetenciesByName, ITocCompetencyGroup } from '../../utils/competency.util'
@Component({
  standalone: false,
  selector: 'ws-app-app-toc-desktop-modal',
  templateUrl: './app-toc-desktop-modal.component.html',
  styleUrls: ['./app-toc-desktop-modal.component.scss'],

})
export class AppTocDesktopModalComponent implements OnInit {
  cometencyData: ITocCompetencyGroup[] = []
  constructor(
    public dialogRef: MatDialogRef<AppTocDesktopModalComponent>,
    private readonly router: Router,
    @Inject(MAT_DIALOG_DATA) public content: any,
    private readonly logger: LoggerService
  ) { }

  ngOnInit() {
    if (this.content.type === 'COMPETENCY') {
      this.competencyData(this.content.competency)
    }
  }
  showOrgprofile(orgId: string) {
    this.dialogRef.close()
    this.router.navigate(['/app/org-details'], { queryParams: { orgId } })
  }
  competencyData(data: any) {
    // `data` is whatever competencies_v1 held — a JSON string, an array, or nothing usable.
    // groupCompetenciesByName never throws, so an unparseable value renders the empty state
    // instead of killing the dialog.
    this.cometencyData = groupCompetenciesByName(data)
    this.logger.log('inside', this.cometencyData, 'name')
    return this.cometencyData
  }

}

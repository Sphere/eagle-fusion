import { Component, Inject, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
// import { UtilityService } from "../../../../../../../../../library/ws-widget/utils/src/public-api"
// import { ConfigurationsService } from "library/ws-widget/utils/src/lib/services/configurations.service"

@Component({
  selector: "app-congratulations-popup",
  templateUrl: "./congratulations-popup.component.html",
  styleUrls: ["./congratulations-popup.component.scss"],
})
export class CongratulationsPopupComponent implements OnInit {
  designation = "";
  earnedBadge: boolean | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CongratulationsPopupComponent>
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.close()
    }, 3000)
  }

  close() {
    this.dialogRef.close({ completed: true })
  }
}

import { Component, Inject, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { ConfigurationsService, LoggerService, TelemetryService } from "../../../../../../../../../library/ws-widget/utils/src/public-api"
import { LanguageService } from "../../../../../../../../../src/app/services/language.service"
import { PlaylistService } from "../../../../../../../../../src/app/services/playlist.service"

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
    private configSvc: ConfigurationsService,
    private languageSvc: LanguageService,
    private playlsSvc: PlaylistService,
    private dialogRef: MatDialogRef<CongratulationsPopupComponent>,
    private telemetrySvc: TelemetryService,
    private logger: LoggerService
  ) { }

  async ngOnInit() {
    let profile: any = this.configSvc?.unMappedUser?.profileDetails?.profileReq
    this.designation = profile?.professionalDetails[0]?.designation || ""
    const currentLang = this.languageSvc.getCurrentLanguage()
    this.generateInteractTelemetry()
    this.fetchPlayLists(currentLang, this.designation)
      .then((playlists) => {
        this.earnedBadge = false
        this.logger.log("playlists", playlists, this.data.collectionId)
        if (
          (this.designation.includes("MP") ||
            this.designation.toLowerCase().includes("mp")) &&
          playlists &&
          playlists.length > 0
        ) {
          if (playlists.includes(this.data.collectionId)) {
            this.earnedBadge = true
            this.playlsSvc.setEarnedBadges(1, true)
          }
        }
      })
      .catch(() => {
        this.earnedBadge = false
      })
    setTimeout(() => {
      this.close()
    }, 3000)
  }

  close() {
    this.dialogRef.close({ completed: true })
  }

  generateInteractTelemetry() {
    const data: any = {
      id: this.data.collectionId || "",
      type: undefined,
      version: "",
      "rollup": {
        "l1": this.data.collectionId || ""
      }
    }
    const extras: any = {
      values: [{
        identifier: this.data.collectionId || "",
        completionPercentage: 100,
      }]
    }
    this.telemetrySvc.interact('open-congratulation-popup', 'popup-open', 'course-completion-popup', data, extras)
  }

  fetchPlayLists(language: string, type: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.playlsSvc.getPlaylistConfig().then((response: any) => {
        const payload = response?.result?.playlist
          ?.find((item: any) => item.language === language && item.role.includes(type))
          ?.dataSource?.payload || []
        resolve(payload)
      }).catch(err => {
        reject(err)
      })
    })
  }
}

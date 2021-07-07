import { Component, Input, OnInit } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { IBadgeResponse, IBadgeRecent } from '../../../../../../../../project/ws/app/src/lib/routes/profile/routes/badges/badges.model'
import { BadgesService } from '../../../../../../../../project/ws/app/src/lib/routes/profile/routes/badges/badges.service'
import { NsContent } from '../../../_services/widget-content.model'
import { DialogConfirmComponent } from './../../../../../../../../src/app/component/dialog-confirm/dialog-confirm.component'
import moment from 'moment'
import { Router } from '@angular/router'
import { UserProfileService } from '../../../../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'

const courseId = {
  nqocnId: 'lex_auth_01311423170518220869',
  fernadezId: 'lex_auth_01308384668903833673',
  iNCCourseId: 'lex_auth_013268426750025728383',
}
@Component({
  selector: 'ws-widget-download-certificate',
  templateUrl: './download-certificate.component.html',
  styleUrls: ['./download-certificate.component.scss'],
})

export class DownloadCertificateComponent implements OnInit {
  @Input() content: NsContent.IContent | null = null
  @Input() progress: any
  @Input() badgeData!: IBadgeRecent
  badges: IBadgeResponse
  imageUrl = '/fusion-assets/icons/certificate.jpg'
  certificateUrl = '/fusion-assets/files/image-content.txt'
  iNCCertificateUrl = '/fusion-assets/files/iNC-certificate.txt'
  allowDownload = false
  showDownloadCertificate = false
  userFullname = ''
  receivedDate = ''

  // tslint:disable-next-line:max-line-length
  imageContent = fetch(this.certificateUrl)
    .then(response => response.text())
    .then(data => { (this as any).imageContent = data })
  // tslint:disable-next-line:max-line-length
  iNCCertificate = fetch(this.iNCCertificateUrl)
    .then(response => response.text())
    .then(data => { (this as any).iNCCertificate = data })
  rnNumber = ''
  contentId: any
  showLoader = false

  constructor(
    private userProfileSvc: UserProfileService,
    public dialog: MatDialog,
    private badgesSvc: BadgesService,
    private router: Router,
    private snackBar: MatSnackBar) {
    this.badges = {
      canEarn: [],
      closeToEarning: [],
      earned: [],
      lastUpdatedDate: '',
      recent: [],
      totalPoints: [{ collaborative_points: 0, learning_points: 0 }],
    }
  }

  ngOnInit() {
    if (this.progress === 0 && !this.badgeData) {
      if (this.content && this.content.progress && this.content.progress.progressStatus) {
        this.progress = this.content.progress.progressStatus
      }
    } else
      if (this.badgeData) {
        this.progress = 1
      }
  }

  downloadCertificate() {
    this.showLoader = true
    // Get latest batches
    this.badgesSvc.fetchRecentBadge()
    if (!this.badgeData || this.content && this.content.identifier.includes(courseId.iNCCourseId)) {
      this.updateBadges()
    } else if (this.badgeData) {
      this.receivedDate = this.badgeData.last_received_date
    }

    this.userProfileSvc.getUserdetailsFromRegistry().subscribe(
      userData => {
        this.showLoader = false

        if (userData[0].personalDetails.middlename) {
          // tslint:disable-next-line:max-line-length
          this.userFullname = `${this.titleCaseWord(userData[0].personalDetails.firstname)} ${this.titleCaseWord(userData[0].personalDetails.middlename)} ${this.titleCaseWord(userData[0].personalDetails.surname)}`
        } else {
          // tslint:disable-next-line:max-line-length
          this.userFullname = `${this.titleCaseWord(userData[0].personalDetails.firstname)} ${this.titleCaseWord(userData[0].personalDetails.surname)}`
        }
        // tslint:disable-next-line:max-line-length
        if (this.content && this.content.identifier.includes(courseId.iNCCourseId) || (this.badgeData && this.badgeData.badge_id === courseId.iNCCourseId)) {
          // tslint:disable-next-line:max-line-length
          if (userData[0].personalDetails.regNurseRegMidwifeNumber === undefined || userData[0].personalDetails.regNurseRegMidwifeNumber === '') {
            // this.showRNEntryDialog()
            const dialogRef = this.dialog.open(DialogConfirmComponent, {
              data: {
                title: 'RN Number is missing from your profile',
                body: `If you are a Registered Nurse/Midwife please update your Registration Number
                 (RN Number) on the profile and then try downloading the certificate.
                If you don't have RN Number click on 'Download Now'`,
              },
              width: '600px',
            })
            dialogRef.afterClosed().subscribe(value => {
              if (value === 'edit') {
                this.router.navigate(['app/user-profile/details'])
              } else
                if (value === 'download') {
                  this.updateBadges()
                  this.rnNumber = 'Public Health Professional'
                  this.callDownloadPDF()
                }
            })
          } else {
            this.rnNumber = `RM/RN - ${userData[0].personalDetails.regNurseRegMidwifeNumber}`
            this.callDownloadPDF()
          }
        } else {
          if (this.badgeData) {
            this.callDownloadPDF()
          }
        }
      },
      err => {
        this.showLoader = false
        this.openSnackbar(err)
      })
  }

  // Fetch badge data for certificate download
  fetchBadges() {
    this.badgesSvc.fetchBadges().subscribe(data => {
      this.showLoader = false
      this.badges = data
      if (this.content && data) {
        if (this.content.identifier.includes('img')) {
          this.contentId = this.content.identifier.substring(0, this.content.identifier.length - 4)
        } else {
          this.contentId = this.content.identifier
        }
        this.getReceivedDate(this.contentId)
      }
    })
  }
  updateBadges() {
    this.showLoader = true
    this.badgesSvc.reCalculateBadges().subscribe(
      _ => {
        return this.fetchBadges()
      })
  }

  getReceivedDate(badgeId: string) {
    this.badges.recent.forEach(badge => {
      if (badge.badge_id === badgeId) {
        this.receivedDate = badge.last_received_date
      }
    })
    if (this.receivedDate === '') {
      this.badges.earned.forEach(badge => {
        if (badge.badge_id === badgeId) {
          this.receivedDate = badge.last_received_date
        }
      })
    }

    if (this.receivedDate && (this.contentId !== courseId.iNCCourseId)) {
      this.callDownloadPDF()
    }
  }

  callDownloadPDF() {
    let contentId = ''
    if (this.content) {
      contentId = this.content.identifier
    } else
      if (this.badgeData) {
        contentId = this.badgeData.badge_id
      }

    if (contentId.includes(courseId.fernadezId) || contentId.includes(courseId.iNCCourseId)) {
      this.downloadPdf(contentId)
    } else
      if (contentId.includes(courseId.nqocnId)) {
        if (this.receivedDate) {
          this.allowDownload = moment(this.receivedDate).isSameOrAfter('2021-03-08')
        }
        if (this.allowDownload) {
          this.downloadPdf(courseId.nqocnId)
        }
      }
  }

  getBase64Image(img: any) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (img) {
      canvas.width = img.width
      canvas.height = img.height
      if (ctx) {
        ctx.drawImage(img, 0, 0)
      }
    }
    const dataURL = canvas.toDataURL('image/jpeg')
    return dataURL
  }

  downloadPdf(badgeId: string) {
    let imageData = ''
    // Fernandes course
    if (badgeId.includes(courseId.fernadezId) && (this.content || this.badgeData)) {
      this.showLoader = true
      const doc = new jsPDF('landscape', 'mm', [297, 210])
      const width = doc.internal.pageSize.getWidth()
      const height = doc.internal.pageSize.getHeight()
      let contentName = ''
      if (this.content) {
        contentName = this.content.name
      } else {
        contentName = this.badgeData.badge_name
      }

      imageData = this.getBase64Image(document.getElementById('imageUrl'))
      if (this.userFullname && this.receivedDate) {
        doc.addImage(imageData, 'JPG', 0, 0, width, height)
        doc.setFontSize(20)
        doc.setTextColor(100);

        (doc as any).autoTable({
          body: [
            [{
              // tslint:disable-next-line:max-line-length
              content: `${contentName} \n by ${`${this.userFullname}`}`,
              colSpan: 2,
              rowSpan: 2,
              styles: { halign: 'center', valign: 'middle' },
            }],
          ],
          theme: 'plain',
          columnStyles: { 0: { halign: 'center', font: 'times', fontSize: 24, minCellHeight: 50 } },
          margin: { top: 80 },
        })

        doc.setTextColor(0, 0, 0)
        doc.setFont('times')
        doc.text(`Completed On ${this.receivedDate}`, 112, 110)
        doc.save('certificate_fernandez.pdf')
        this.showLoader = false
      }
    } else
      if (badgeId.includes(courseId.iNCCourseId)) { // INC Course
        this.showLoader = true
        let dataImage = ''
        const req = {
          course: courseId.iNCCourseId,
        }
        let responseQRCode = ''
        this.badgesSvc.generateQRCode(req).subscribe(data => {
          responseQRCode = data.data
          if (data) {
            this.showLoader = false
            dataImage = this.iNCCertificate.toString()
            const doc = new jsPDF('landscape', 'mm', [297, 190])
            const width = doc.internal.pageSize.getWidth()
            const height = doc.internal.pageSize.getHeight()
            if (dataImage && this.userFullname) {
              doc.addImage(dataImage, 'JPG', 0, 0, width, height)

              const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight() + 30
              const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth() + 30
              const name = `${this.userFullname}`
              const str = `${this.rnNumber}`
              doc.setTextColor(1)
              doc.setFontSize(20)
              doc.setFont('times')
              doc.text(name, pageWidth / 2 + 28, pageHeight - 82, { align: 'center' })
              doc.text(str, pageWidth / 2 + 28, pageHeight - 72, { align: 'center' })
              doc.addImage(responseQRCode, 'png', 20, 137, 40, 37)

              doc.setFontSize(10)
              doc.text(`Download date ${moment(new Date()).format('DD/MM/YYYY')}`, 20, 186)
              doc.text(`Awarded On ${this.receivedDate}`, 150, 186)
              doc.save('certificate_inc.pdf')
            }
          }
        },
          err => {
            this.openSnackbar(err)
          })

      } else { // POCQI NQOCN certificate
        this.showLoader = true
        const req = {
          course: badgeId,
        }
        let responseQRCode = ''
        let dataImage = ''
        this.badgesSvc.generateQRCode(req).subscribe(data => {
          this.showLoader = false
          responseQRCode = data.data
          if (data && this.userFullname) {
            dataImage = this.imageContent.toString()

            const doc = new jsPDF('landscape', 'mm', [297, 190])
            const width = doc.internal.pageSize.getWidth()
            const height = doc.internal.pageSize.getHeight()

            doc.addImage(dataImage, 'JPG', 0, 0, width, height)

            doc.setFontSize(20)
            doc.setTextColor(100);

            (doc as any).autoTable({
              body: [
                [{
                  content: `${this.userFullname}`,
                  colSpan: 2,
                  rowSpan: 2,
                  styles: { halign: 'center' },
                }],
              ],
              theme: 'plain',
              columnStyles: { 0: { halign: 'center', font: 'times', fontSize: 24, minCellHeight: 50 } },
              margin: { top: 88 },

            })
            doc.addImage(responseQRCode, 'png', 5, 140, 40, 40)
            doc.save('certificate_pocqi.pdf')
          }
        },
          err => {
            this.openSnackbar(err)
          })
      }
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

  titleCaseWord(word: any) {
    if (!word) { return word }
    {
      const trimmedWord = word.trimEnd()
      return `${trimmedWord[0].toUpperCase() + trimmedWord.substr(1).toLowerCase()}`
    }
  }
}

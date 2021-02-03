import { Component, OnInit, Input } from '@angular/core'
import { IBadgeRecent } from '../../../badges/badges.model'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

@Component({
  selector: 'ws-app-badges-card',
  templateUrl: './badges-card.component.html',
  styleUrls: ['./badges-card.component.scss'],
})
export class BadgesCardComponent implements OnInit {
  @Input()
  badge!: IBadgeRecent
  @Input() userName!: string
  imageUrl = '/fusion-assets/icons/certificate.jpg'
  constructor() { }

  ngOnInit() { }
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

  downloadPdf() {
    const doc = new jsPDF('landscape', 'mm', [297, 210])
    const width = doc.internal.pageSize.getWidth()
    const height = doc.internal.pageSize.getHeight()

    const imageData = this.getBase64Image(document.getElementById('imageUrl'))
    doc.addImage(imageData, 'JPG', 0, 0, width, height)

    doc.setFontSize(20)
    doc.setTextColor(100);

    (doc as any).autoTable({
      body: [
        [{
          content: `${this.badge.badge_name} \n  by ${this.userName} \n Completed on ${this.badge.first_received_date}`,
          colSpan: 2,
          rowSpan: 2,
          styles: { halign: 'center' },
        }],
      ],
      theme: 'plain',
      columnStyles: { 0: { halign: 'center', font: 'times', fontSize: 24, minCellHeight: 50 } },
      margin: { top: 80 },

    })

    // Download PDF document
    doc.save('certificate.pdf')
  }
}

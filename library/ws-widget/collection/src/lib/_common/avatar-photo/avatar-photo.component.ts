import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-widget-avatar-photo',
  templateUrl: './avatar-photo.component.html',
  styleUrls: ['./avatar-photo.component.scss'],
})
export class AvatarPhotoComponent implements OnInit {
  @Input() datalen: any

  @Input()
  public photoUrl!: string

  @Input()
  public name!: string
  @Input() public size = ''
  @Input() randomColor = false
  @Input() initials?: string
  public showInitials = false
  public circleColor!: string
  random = Math.random().toString(36).slice(2)

  // public initials!: string

  private colors = [
    '#EB7181', // red
    '#306933', // green
    '#000000', // black
    '#3670B2', // blue
    '#4E9E87',
    '#7E4C8D',
  ]

  private randomcolors = [
    '#EB7181', // red
    '#006400', // green
    '#000000', // black
    '#3670B2', // blue
    '#4E9E87',
    '#7E4C8D',
  ]

  ngOnInit() {
    if (!this.photoUrl) {
      this.showInitials = true
      if (!this.initials) {
        this.createInititals()
      }
      if (this.datalen === 1) {
        this.randomcolors = [
          '#006400', // green
        ]
      }
      const randomIndex = Math.floor(Math.random() * Math.floor(this.colors.length))
      this.circleColor = this.colors[randomIndex]
      if (this.randomColor) {
        const randomIndex1 = Math.floor(Math.random() * Math.floor(this.randomcolors.length))
        this.circleColor = this.randomcolors[randomIndex1]
      }
    }
  }

  private createInititals(): void {
    let initials = ''
    const array = `${this.name} `.toString().split(' ')
    if (array[0] !== 'undefined' && typeof array[1] !== 'undefined') {
      initials += array[0].charAt(0)
      initials += array[1].charAt(0)
    } else {
      for (let i = 0; i < this.name.length; i += 1) {
        if (this.name.charAt(i) === ' ') {
          continue
        }

        if (this.name.charAt(i) === this.name.charAt(i)) {
          initials += this.name.charAt(i)

          if (initials.length === 2) {
            break
          }
        }
      }
    }
    this.initials = initials.toUpperCase()
  }
}

import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core'
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { IWidgetImageMap, IWidgetMapMeta } from '@ws-widget/collection/src/lib/image-map-responsive/image-map-responsive.model'
import { AUTHORING_CONTENT_BASE, CONTENT_BASE_WEBHOST_ASSETS } from '@ws/author/src/lib/constants/apiEndpoints'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { FILE_MAX_SIZE } from './../../../../../../../../../constants/upload'

@Component({
  selector: 'ws-auth-image-map',
  templateUrl: './image-map.component.html',
  styleUrls: ['./image-map.component.scss'],
})
export class ImageMapComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: false }) canvas!: ElementRef
  @ViewChild('image', { static: false }) image!: ElementRef
  @ViewChildren('title') title!: QueryList<ElementRef>
  @Input() identifier = ''
  @Input() content!: IWidgetImageMap
  @Input() isSubmitPressed = false
  @Output() data = new EventEmitter<{ content: IWidgetImageMap; isValid: boolean }>()
  form!: FormGroup
  startX1 = 0
  startY1 = 0
  startX2 = 0
  startY2 = 0
  mouseX = 0
  mouseY = 0
  drag = false
  isDragging = false
  isInsideShape = false
  selectedShapeIndex!: number
  selectedRadio = 0
  mapName!: string
  clickCount = 0
  enableMouseClick = false
  imageAvailable = false
  interval: any

  constructor(
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    public formBuilder: FormBuilder,
    private loader: LoaderService,
  ) { }

  ngOnInit() {
    this.initializeForm()

    if (this.content.map && this.content.map.length) {
      this.enableMouseClick = false
      this.content.map.map(v => {
        this.addImageMapToForm(v)
      })
    }

    if (!(this.form.controls.imageSrc.value === '')) {
      this.imageAvailable = true
    }
  }

  initializeForm() {
    this.selectedRadio = 0
    this.form = this.formBuilder.group({
      imageHeight: [this.content.imageHeight || ''],
      imageWidth: [this.content.imageWidth || ''],
      imageSrc: [this.content.imageSrc || '', Validators.required],
      mapName: [this.content.mapName || ''],
      map: this.formBuilder.array([]),
    })
    this.form.valueChanges.pipe(debounceTime(100), distinctUntilChanged()).subscribe({
      next: () => {
        this.content = this.form.value
        this.data.emit({
          content: this.form.value,
          isValid: this.form.valid,
        })
      },
    })
  }
  ngAfterViewInit() {
    if (this.form.controls.imageSrc.value && this.form.controls.imageSrc.value.length) {
      this.initializeCanvas(true)
    }
  }

  setLinkValue(index: number, value: string) {
    // let url: string = './page/'
    // let identifier = this.identifier
    // if (identifier.indexOf('.') > -1) {
    //   identifier = identifier.substring(0, identifier.indexOf('.'))
    // }
    // url = url.concat(identifier).concat('#').concat(value)
    // console.log(url)
    const link = this.paths.at(index).get('link') as AbstractControl
    link.setValue(`./page/${this.identifier.replace('.img', '')}#${value}`)
  }

  get paths(): FormArray {
    return this.form.get('map') as FormArray
  }

  selectionChange(event: any, index: number) {
    if (event.value === 'anchor') {
      (this.paths.at(index).get('target') as AbstractControl).setValue('_self')
    } else if (event.value === 'url') {
      (this.paths.at(index).get('target') as AbstractControl).setValue('_blank')
    }
  }

  addImageMapToForm(data?: IWidgetMapMeta) {
    this.paths.push(
      this.formBuilder.group({
        coords: this.formBuilder.array([
          new FormControl(data && data.coords ? data.coords[0] || 0 : 0),
          new FormControl(data && data.coords ? data.coords[1] || 0 : 0),
          new FormControl(data && data.coords ? data.coords[2] || 0 : 0),
          new FormControl(data && data.coords ? data.coords[3] || 0 : 0),
        ]),
        alt: [data ? data.alt || '' : ''],
        title: [data ? data.title || '' : ''],
        link: [data ? data.link || '' : ''],
        target: [data ? data.target || '_self' : '_self'],
      }),
    )
  }

  clearImagMapForm() {
    while (this.paths.length !== 0) {
      this.paths.removeAt(0)
    }
  }

  upload(file: File) {
    if (!(this.form.controls.imageSrc.value === '')) {
      this.imageAvailable = true
    }
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (!(file.type.indexOf('image/') > -1)) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.type.indexOf('image/') > -1 && file.size > FILE_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    formdata.append('content', file, fileName)
    this.loader.changeLoad.next(true)
    this.uploadService
      .upload(formdata, { contentId: this.identifier, contentType: CONTENT_BASE_WEBHOST_ASSETS })
      .subscribe(
        data => {
          if (data.code) {
            // if (this.paths.length > 0) {
            //   this.clearImagMapForm()
            // }
            if (!this.imageAvailable) {
              this.initializeForm()
              this.addImageMapForm()
            }

            this.mapName = fileName.replace(/\.[^/.]+$/, '')
            this.form.controls.imageSrc.setValue(
              `${AUTHORING_CONTENT_BASE}${encodeURIComponent(
                `/${data.artifactURL
                  .split('/')
                  .slice(3)
                  .join('/')}`,
              )}`,
            )
            this.form.controls.mapName.setValue(this.mapName)

            if (!this.imageAvailable) {
              this.initializeCanvas()
              this.imageAvailable = false
            } else {
              this.initializeCanvas(true)
              this.selectedRadio = 0
            }
            this.snackBar.openFromComponent(NotificationComponent, {
              data: {
                type: Notify.UPLOAD_SUCCESS,
              },
              duration: NOTIFICATION_TIME * 1000,
            })
          }
        },
        () => {
          this.loader.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.UPLOAD_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
  }

  removeButtonClick(index: number) {
    if (this.paths.length > 1) {
      this.paths.removeAt(index)
    } else {
      this.paths.removeAt(index)
      this.addImageMapForm()
    }

    this.canvas.nativeElement
      .getContext('2d')
      .clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
    this.drawAll(this.canvas.nativeElement.getContext('2d'))
    this.selectedRadio = 0
    this.drawOutsideBorder(this.selectedRadio)
  }

  initializeCanvas(canDraw = false) {
    setTimeout(() => {
      this.loader.changeLoad.next(true)
      const context = this.canvas.nativeElement.getContext('2d')
      const img = new Image()
      img.src = this.form.controls.imageSrc.value
      img.onload = () => {
        this.canvas.nativeElement.width = img.naturalWidth || img.width
        this.canvas.nativeElement.height = img.naturalHeight || img.height
        this.form.controls.imageHeight.setValue(img.naturalHeight || img.height)
        this.form.controls.imageWidth.setValue(img.naturalWidth || img.width)
        this.canvas.nativeElement.scrollIntoView()
        if (canDraw) {
          this.drawAll(context)
          if (this.content.map && this.content.map.length) {
            this.drawOutsideBorder(0)
          }
        }
        this.loader.changeLoad.next(false)
      }
      img.onerror = () => {
        this.loader.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.UPLOAD_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      }
    },         100)
  }

  mouseDownEvent(event: any) {
    if (this.enableMouseClick) {
      const canvasTop = this.canvas.nativeElement.getBoundingClientRect().top
      const canvasLeft = this.canvas.nativeElement.getBoundingClientRect().left
      this.mouseX = event.clientX - canvasLeft
      this.mouseY = event.clientY - canvasTop
      for (const imageMap of this.paths.value) {
        if (this.isMouseInShape(this.mouseX, this.mouseY, imageMap)) {
          break
        }
      }
      if (this.isInsideShape) {
        this.handleMouseDown(event)
        this.drag = false
      } else {
        event.target.style.cursor = 'crosshair'
        this.drag = true

        if (this.clickCount === 0) {
          this.startX1 = event.clientX
          this.startY1 = event.clientY
        } else if (this.clickCount === 1) {
          this.startX2 = event.clientX
          this.startY2 = event.clientY
        }
        this.clickCount = this.clickCount + 1
      }
    }
    // const x = event.clientX - canvasLeft
    // const y = event.clientY - canvasTop
    // context.beginPath()
    // context.globalAlpha = 0.5
    // context.strokeStyle = 'black'
    // context.arc(x, y, 6, 0, 2 * Math.PI, true)
    // context.fill()
  }

  mouseUpEvent(event: any) {
    if (this.isDragging || (this.isDragging && this.clickCount === 2)) {
      this.clickCount = 0
      this.drag = false
      this.isDragging = false
      this.enableMouseClick = false
      event.target.style.cursor = 'initial'
      const canvasTop = this.canvas.nativeElement.getBoundingClientRect().top
      const canvasLeft = this.canvas.nativeElement.getBoundingClientRect().left
      const x = this.startX1 - canvasLeft
      const y = this.startY1 - canvasTop
      const w = event.clientX - canvasLeft - x
      const h = event.clientY - canvasTop - y
      this.canvas.nativeElement.getContext('2d').globalAlpha = 0.3
      this.canvas.nativeElement.getContext('2d').fillStyle = 'black'
      this.canvas.nativeElement.getContext('2d').setLineDash([6])
      this.canvas.nativeElement.getContext('2d').fillRect(x, y, w, h)
      setTimeout(() => {
        const focusTitle = this.title.filter((_, index: number) => index === this.selectedRadio)
        focusTitle[0].nativeElement.focus()
      },         400)
      this.addCoordsToForm(event.clientX - canvasLeft, event.clientY - canvasTop, x, y)
      // } else {
      //   this.handleMouseUp(event)
      // }
    }
  }

  mouseMoveEvent(event: any) {
    if (this.enableMouseClick) {
      event.target.style.cursor = 'crosshair'
      if (this.drag) {
        this.isDragging = true
        const x = this.startX1 - this.canvas.nativeElement.getBoundingClientRect().left
        const y = this.startY1 - this.canvas.nativeElement.getBoundingClientRect().top
        const w = event.clientX - this.canvas.nativeElement.getBoundingClientRect().left - x
        const h = event.clientY - this.canvas.nativeElement.getBoundingClientRect().top - y
        this.canvas.nativeElement
          .getContext('2d')
          .clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
        this.drawAll(this.canvas.nativeElement.getContext('2d'))
        this.canvas.nativeElement.getContext('2d').globalAlpha = 1
        this.canvas.nativeElement.getContext('2d').fillStyle = 'black'
        this.canvas.nativeElement.getContext('2d').setLineDash([6])
        this.canvas.nativeElement.getContext('2d').strokeRect(x, y, w, h)
      }
    } else {
      event.target.style.cursor = 'initial'
    }
  }

  onRightClick(event: any) {
    event.preventDefault()
    event.stopPropagation()
    return false
  }

  addCoordsToForm(x1: number, y1: number, x2: number, y2: number) {
    const coords = this.paths.at(this.selectedRadio).get('coords') as any
    coords.get('0').setValue(x2)
    coords.get('1').setValue(y2)
    coords.get('2').setValue(x1)
    coords.get('3').setValue(y1)
  }

  // addImageMapDetails() {
  //   this.title.forEach((_, index) => {
  //     const coordinates = this.paths.at(index).get('coords') as FormArray
  //     this.imageMapDetails.push({
  //       coords: [
  //         (coordinates.get('0') as AbstractControl).value,
  //         (coordinates.get('1') as AbstractControl).value,
  //         (coordinates.get('2') as AbstractControl).value,
  //         (coordinates.get('3') as AbstractControl).value],
  //       alt: (this.paths.at(index).get('alt') as AbstractControl).value,
  //       title: (this.paths.at(index).get('title') as AbstractControl).value,
  //       link: (this.paths.at(index).get('link') as AbstractControl).value,
  //       target: (this.paths.at(index).get('target') as AbstractControl).value,
  //     })
  //   })
  // }

  isMouseInShape(mouseX: number, mouseY: number, imageMap: IWidgetMapMeta) {
    const left = imageMap.coords[2]
    const right = imageMap.coords[0]
    const top = imageMap.coords[3]
    const bottom = imageMap.coords[1]
    if (mouseX > left && mouseX < right && mouseY > top && mouseY < bottom) {
      this.isInsideShape = true
      return true
    }
    this.isInsideShape = false
    return false
  }

  handleMouseDown(event: any) {
    event.preventDefault()
    event.stopPropagation()
    const canvasTop = this.canvas.nativeElement.getBoundingClientRect().top
    const canvasLeft = this.canvas.nativeElement.getBoundingClientRect().left
    this.mouseX = event.clientX - canvasLeft
    this.mouseY = event.clientY - canvasTop
    this.paths.value.forEach((item: IWidgetMapMeta, index: number) => {
      if (this.isMouseInShape(this.mouseX, this.mouseY, item)) {
        this.selectedShapeIndex = index
      }
      this.isDragging = true
      return
    })
  }

  handleMouseUp(event: any) {
    if (!this.isDragging) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false
  }

  mouseOutEvent(event: any) {
    if (!this.isDragging) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false
  }

  // handleMouseMove(event: any) {
  //   if (!this.isDragging)
  //     return;
  //   event.preventDefault();
  //   event.stopPropagation();
  //   const canvasTop = this.canvas.nativeElement.getBoundingClientRect().top
  //   const canvasLeft = this.canvas.nativeElement.getBoundingClientRect().left
  //   let mouseCurrentX = event.clientX - canvasLeft
  //   let mouseCurrentY = event.clientY - canvasTop
  //   let dragX = mouseCurrentX - this.startX1
  //   let dragY = mouseCurrentY - this.startY1
  //   let selectedShape = this.imageMapDetails[this.selectedShapeIndex]
  //   selectedShape.coords[0] += dragX
  //   selectedShape.coords[1] += dragY
  //   this.initializeCanvas(true)
  //   this.mouseX = mouseCurrentX
  //   this.mouseY = mouseCurrentY
  // }

  // drawAll(context: any) {
  //   this.imageMapDetails.forEach(item => {
  //     const width = Math.abs(item.coords[2] - item.coords[0])
  //     const height = Math.abs(item.coords[3] - item.coords[1])
  //     context.globalAlpha = 0.5
  //     context.strokeStyle = 'white'
  //     context.fillRect(item.coords[2], item.coords[3], width, height)
  //     //console.log("from drawALL: " + item.coords[2], item.coords[3], width, height);

  //   })
  //   this.drawAllnew(context)
  // }

  drawAll(context: any) {
    this.paths.value.forEach((element: IWidgetMapMeta) => {
      const width = Math.abs(element.coords[2] - element.coords[0])
      const height = Math.abs(element.coords[3] - element.coords[1])
      context.globalAlpha = 0.3
      context.fillStyle = 'black'
      context.fillRect(element.coords[0], element.coords[1], width, height)
    })
  }

  drawOutsideBorder(event: number) {
    const context = this.canvas.nativeElement.getContext('2d')
    if (this.checkCoordsValue(event)) {
      this.enableMouseClick = false
      const element = this.paths.value[event]
      context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
      this.drawAll(this.canvas.nativeElement.getContext('2d'))
      context.globalAlpha = 1
      context.fillStyle = 'black'
      this.canvas.nativeElement.getContext('2d').setLineDash([6])
      this.canvas.nativeElement
        .getContext('2d')
        .strokeRect(
          element.coords[0],
          element.coords[1],
          Math.abs(element.coords[2] - element.coords[0]),
          Math.abs(element.coords[3] - element.coords[1]),
        )
    } else {
      this.enableMouseClick = true
      context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
      this.drawAll(this.canvas.nativeElement.getContext('2d'))
    }
  }

  checkCoordsValue(index: number) {
    let coordsPresent = false
    const map = this.paths.value[index]
    let i = 0
    if (map && map.coords) {
      while (i < map.coords.length) {
        if (map.coords[i] > 0) {
          return (coordsPresent = true)
        }
        i = i + 1
      }
      // for (const coordinate of map.coords) {
      //   if (coordinate > 0) {
      //     return (coordsPresent = true)
      //   }
      // }
    }
    return coordsPresent
  }

  addImageMapForm() {
    this.enableMouseClick = true
    this.addImageMapToForm()
    this.selectedRadio = this.paths.length - 1
    if (this.paths.length > 1) {
      const context = this.canvas.nativeElement.getContext('2d')
      context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
      this.drawAll(this.canvas.nativeElement.getContext('2d'))
    }
  }

  // compareURL(url: string): string {
  //   const presentDomain = window.location.hostname
  //   const inputURL = document.createElement('a')
  //   let pathName = ''
  //   inputURL.setAttribute('href', url)
  //   if (presentDomain === inputURL.hostname)
  //     pathName = inputURL.pathname
  //   else
  //     pathName = url
  //   //console.log(pathName)
  //   return pathName

  // }
}

import { of } from 'rxjs'
import { ImageCropComponent } from './image-crop.component'

describe('ImageCropComponent', () => {
  let component: ImageCropComponent
  let dialogRef: any
  let configSvc: any
  let snackBar: any
  let valueSvc: any
  let translate: any

  const imageFile = new File(['data'], 'photo.png', { type: 'image/png' })

  const build = (data: any = {}) => new ImageCropComponent(
    dialogRef, configSvc, snackBar, valueSvc, translate,
    { isRoundCrop: false, imageFile, height: 200, width: 400, imageFileName: 'photo.png', ...data },
  )

  beforeEach(() => {
    dialogRef = { close: jest.fn(), updateSize: jest.fn() }
    configSvc = { instanceConfig: null }
    snackBar = { open: jest.fn() }
    valueSvc = { isXSmall$: of(false) }
    translate = { instant: jest.fn((k: string) => k) }
    component = build()
  })

  afterEach(() => jest.clearAllMocks())

  describe('construction', () => {
    it('should copy the dialog data onto the component', () => {
      expect(component).toBeTruthy()
      expect(component.isRoundCrop).toBe(false)
      expect(component.imageFile).toBe(imageFile)
      expect(component.fileName).toBe('photo.png')
      expect(component.opHeight).toBe(200)
      expect(component.opWidth).toBe(400)
    })

    it('should skip the target dimensions for a round crop', () => {
      const round = build({ isRoundCrop: true })
      expect(round.isRoundCrop).toBe(true)
      expect(round.opHeight).toBeUndefined()
      expect(round.opWidth).toBeUndefined()
    })

    it('should tolerate missing file, name and dimensions', () => {
      const bare = build({ imageFile: null, imageFileName: '', height: 0, width: 0 })
      expect(bare.imageFile).toBeUndefined()
      expect(bare.fileName).toBe('')
      expect(bare.opHeight).toBeUndefined()
      expect(bare.opWidth).toBeUndefined()
    })

    it('should start with the documented defaults', () => {
      expect(component.isNotOfRequiredSize).toBe(false)
      expect(component.imageFileBase64).toBe('')
      expect(component.canvasRotation).toBe(0)
      expect(component.transform).toEqual({})
      expect(component.resetValue).toBe(false)
      expect(component.isXSmall).toBe(false)
      expect(component.isThumbnail).toBe(true)
    })
  })

  describe('ngOnInit', () => {
    it('should size the dialog for a wide viewport', () => {
      component.ngOnInit()
      expect(dialogRef.updateSize).toHaveBeenCalledWith('70%')
      expect(component.isXSmall).toBe(false)
    })

    it('should size the dialog for an extra-small viewport', () => {
      valueSvc.isXSmall$ = of(true)
      component = build()
      component.ngOnInit()
      expect(dialogRef.updateSize).toHaveBeenCalledWith('90%')
      expect(component.isXSmall).toBe(true)
    })
  })

  describe('changeToDefaultImg', () => {
    it('should swap in the configured default content logo', () => {
      configSvc.instanceConfig = { logos: { defaultContent: 'default.png' } }
      const event = { target: { src: 'broken.png' } }
      component.changeToDefaultImg(event)
      expect(event.target.src).toBe('default.png')
    })

    it('should blank the src when there is no instance config', () => {
      const event = { target: { src: 'broken.png' } }
      component.changeToDefaultImg(event)
      expect(event.target.src).toBe('')
    })
  })

  describe('imageCropped', () => {
    it('should store the cropped base64, dimensions and derived file', () => {
      const base64 = `data:image/png;base64,${btoa('image-bytes')}`
      component.imageCropped({ base64, height: 100, width: 150 } as any)

      expect(component.imageFileBase64).toBe(base64)
      expect(component.croppedHeight).toBe(100)
      expect(component.croppedWidth).toBe(150)
      expect(component.cropimageFile).toBeInstanceOf(File)
      expect(component.cropimageFile.name).toBe('photo.png')
    })
  })

  describe('base64ImageToBlob', () => {
    it('should build a jpeg File named after the dialog file name', () => {
      const file = component.base64ImageToBlob(`data:image/png;base64,${btoa('abc')}`)
      expect(file).toBeInstanceOf(File)
      expect(file.name).toBe('photo.png')
      expect(file.type).toBe('image/jpeg')
    })
  })

  describe('openSnackBar', () => {
    it('should show a transient message', () => {
      component.openSnackBar('Too small')
      expect(snackBar.open).toHaveBeenCalledWith('Too small', undefined, { duration: 2000 })
    })
  })

  describe('continueToImageCrop', () => {
    it('should clear the size warning', () => {
      component.isNotOfRequiredSize = true
      component.continueToImageCrop()
      expect(component.isNotOfRequiredSize).toBe(false)
    })
  })

  describe('rotation and flipping', () => {
    it('should decrement the rotation and swap the flip axes on rotate left', () => {
      component.transform = { flipH: true, flipV: false }
      component.rotateLeft()
      expect(component.canvasRotation).toBe(-1)
      expect(component.transform).toEqual({ flipH: false, flipV: true })
    })

    it('should increment the rotation and swap the flip axes on rotate right', () => {
      component.transform = { flipH: false, flipV: true }
      component.rotateRight()
      expect(component.canvasRotation).toBe(1)
      expect(component.transform).toEqual({ flipH: true, flipV: false })
    })

    it('should toggle the horizontal flip', () => {
      component.flipHorizontal()
      expect(component.transform.flipH).toBe(true)
      component.flipHorizontal()
      expect(component.transform.flipH).toBe(false)
    })
  })

  describe('zoom', () => {
    it('should apply the scale and clear the reset flag', () => {
      component.resetValue = true
      component.zoom({ value: 1.5 })
      expect(component.transform.scale).toBe(1.5)
      expect(component.resetValue).toBe(false)
    })

    it('should preserve any existing transform values', () => {
      component.transform = { flipH: true }
      component.zoom({ value: 2 })
      expect(component.transform).toEqual({ flipH: true, scale: 2 })
    })
  })

  describe('reset', () => {
    it('should clear the rotation and transform', () => {
      component.canvasRotation = 3
      component.transform = { scale: 2, flipH: true }
      component.reset()
      expect(component.resetValue).toBe(true)
      expect(component.canvasRotation).toBe(0)
      expect(component.transform).toEqual({})
    })
  })

  describe('dialog exits', () => {
    it('should close with the cropped file when applying', () => {
      const cropped = new File(['x'], 'cropped.png')
      component.cropimageFile = cropped
      component.croppingImage()
      expect(dialogRef.close).toHaveBeenCalledWith(cropped)
    })

    it('should close with nothing when cancelling', () => {
      component.close()
      expect(dialogRef.close).toHaveBeenCalledWith()
    })
  })

  describe('thumbnailSizeDetection', () => {
    const realImage = global.Image
    const realFileReader = global.FileReader
    let reader: any
    let image: any

    beforeEach(() => {
      reader = { readAsDataURL: jest.fn(), result: 'data:image/png;base64,abc', onload: null }
      image = { width: 0, height: 0, onload: null, src: '' }
      ;(global as any).FileReader = jest.fn(() => reader)
      ;(global as any).Image = jest.fn(() => image)
    })

    afterEach(() => {
      ;(global as any).Image = realImage
      ;(global as any).FileReader = realFileReader
    })

    /** Runs the detection then drives the reader and image load callbacks by hand. */
    const detect = (comp: ImageCropComponent, width: number, height: number) => {
      comp.thumbnailSizeDetection()
      reader.onload()
      image.width = width
      image.height = height
      image.onload()
    }

    it('should read the image file as a data url', () => {
      component.thumbnailSizeDetection()
      expect(reader.readAsDataURL).toHaveBeenCalledWith(imageFile)
    })

    it('should record the natural dimensions of the loaded image', () => {
      detect(component, 800, 600)
      expect(component.width).toBe(800)
      expect(component.height).toBe(600)
    })

    it('should warn when the image exactly matches the target size', () => {
      detect(component, 400, 200)
      expect(translate.instant).toHaveBeenCalledWith('IMG_ERR_MSG')
      expect(snackBar.open).toHaveBeenCalledWith('IMG_ERR_MSG', undefined, { duration: 2000 })
      expect(component.isNotOfRequiredSize).toBe(false)
    })

    it('should flag an image narrower than the target width', () => {
      detect(component, 300, 600)
      expect(component.isNotOfRequiredSize).toBe(true)
      expect(snackBar.open).not.toHaveBeenCalled()
    })

    it('should flag an image shorter than the target height', () => {
      detect(component, 800, 100)
      expect(component.isNotOfRequiredSize).toBe(true)
    })

    it('should accept an image larger than the target on both axes', () => {
      detect(component, 800, 600)
      expect(component.isNotOfRequiredSize).toBe(false)
      expect(snackBar.open).not.toHaveBeenCalled()
    })

    it('should skip the size checks entirely for a round crop', () => {
      const round = build({ isRoundCrop: true })
      detect(round, 10, 10)
      expect(round.isNotOfRequiredSize).toBe(false)
      expect(snackBar.open).not.toHaveBeenCalled()
    })

    it('should not warn before the image has loaded', () => {
      component.thumbnailSizeDetection()
      expect(snackBar.open).not.toHaveBeenCalled()
      expect(component.isNotOfRequiredSize).toBe(false)
    })
  })
})

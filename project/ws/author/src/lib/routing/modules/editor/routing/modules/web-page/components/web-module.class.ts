import { IAudioObj } from '../interface/page-interface'

export class Page {
  public fileIndex: number
  public body: string
  public isBdchanged: boolean
  public isInvalid?: boolean
  constructor(init: Partial<Page>) {
    this.body = init.body || ''
    this.fileIndex = init.fileIndex || 0
    this.isBdchanged = init.isBdchanged || true
  }
}

// tslint:disable-next-line: max-classes-per-file
export class ModuleObj {
  public URL: string
  public title: string
  public audio: IAudioObj[]
  constructor(init: Partial<ModuleObj>) {
    this.URL = init.URL || ''
    this.title = init.title || ''
    this.audio = init.audio || []
  }
}

// tslint:disable-next-line: max-classes-per-file
export class WebModuleData {
  public pageJson: ModuleObj[]
  public pages: Page[]
  constructor(init: Partial<any>) {
    this.pageJson = init.pageJson || []
    this.pages = init.pages || []
  }
}

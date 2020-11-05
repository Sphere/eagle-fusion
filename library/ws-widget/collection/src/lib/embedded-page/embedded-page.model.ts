export namespace NsEmbeddedPage {
  export interface IEmbeddedPage {
    title: string
    iframeSrc: string
    containerStyle?: { [key: string]: string }
    containerClass?: string
    iframeId?: string
  }
}

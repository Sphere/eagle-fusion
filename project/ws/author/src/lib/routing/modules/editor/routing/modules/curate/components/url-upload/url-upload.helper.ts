export class URLCheckerClass {

  static youTubeUrlChange(url: string): string {

    const regExp = /^.*(youtube.com\/|embed\/|watch\?v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
    return url
  }
}

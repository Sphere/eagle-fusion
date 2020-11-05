import { NsWidgetResolver } from '@ws-widget/resolver'

export const isNotEmptyWidget = (widgetData: NsWidgetResolver.IRenderConfigWithAnyData): boolean => {
  switch (widgetData.widgetSubType) {
  case 'selectorResponsive':
    if (widgetData.widgetData.selectFrom) {
      for (const data of widgetData.widgetData.selectFrom) {
        if (data.widget.widgetSubType) {
          return isNotEmptyWidget(data.widget)
        }
      }
    }
    return false
  case 'intranetResponsive':
    return checkIframe(widgetData.widgetData.isIntranet.widget)

  case 'elementHtml':
    return checkHTML(widgetData)

  case 'imageMapResponsive':
    return checkImageMap(widgetData)

  case 'galleryView':
    return checkGalleryView(widgetData)

  case 'pageEmbedded':
    return checkIframe(widgetData)

  case 'sliderBanners':
    return checkSliderBanners(widgetData)
  case 'contentStripMultiple':
    return checkContentStripMultiple(widgetData)
  case 'contentStripSingle':
    return checkContentStripSingle(widgetData)
  case 'cardBreadcrumb':
    return checkBreadcrumb(widgetData)
  case 'playerVideo':
    return checkPlayerVideo(widgetData)
  case 'videoWrapper':
    return checkWapperVideo(widgetData)
  default:
    return false
  }
}

const checkWapperVideo = (widgetData: NsWidgetResolver.IRenderConfigWithAnyData) => {
  if (widgetData.widgetData.externalData.iframeSrc) {
    return true
  } if (widgetData.widgetData.videoData.url || widgetData.widgetData.videoData.identifier) {
    return true
  }
  return false
}

const checkIframe = (widgetData: NsWidgetResolver.IRenderConfigWithAnyData) => {
  if (widgetData.widgetData.iframeSrc) {
    return true
  }
  return false
}

const checkPlayerVideo = (widgetData: NsWidgetResolver.IRenderConfigWithAnyData) => {
  if (widgetData.widgetData.identifier || widgetData.widgetData.url) {
    return true
  }
  return false

}

const checkBreadcrumb = (widgetData: NsWidgetResolver.IRenderConfigWithAnyData) => {
  const data = widgetData.widgetData
  if (data.path && data.path.length > 0) {
    let returnStatement = false
    let canBreak = false
    let i = 0
    while (i < data.path.length && !canBreak) {
      if (data.path[i].text) {
        returnStatement = true
        canBreak = true
      }
      i = i + 1
    }
    return returnStatement
  }
  return false
}

const checkHTML = (widgetData: NsWidgetResolver.IRenderConfigWithAnyData): boolean => {
  const data = widgetData.widgetData
  if (data.html) {
    return true
  }
  if (data.template) {
    if (data.templateData.imageSrc || data.templateData.title) {
      return true
    }
  } else if (data.templateUrl) {
    return true
  }
  return false
}

const checkImageMap = (widgetData: NsWidgetResolver.IRenderConfigWithAnyData): boolean => {
  if (widgetData.widgetData.imageSrc) {
    return true
  }
  return false

}

const checkGalleryView = (widgetData: NsWidgetResolver.IRenderConfigWithAnyData): boolean => {
  const data = widgetData.widgetData
  if (data.cardMenu && data.cardMenu.length > 0) {
    let returnStatement = false
    let canBreak = false
    let i = 0
    while (i < data.cardMenu.length && !canBreak) {
      if (data.cardMenu[i].widget.widgetSubType === 'elementHtml') {
        returnStatement = checkHTML(data.cardMenu[i].widget)
      } else if (data.cardMenu[i].widget.widgetSubType === 'playerVideo') {
        returnStatement = checkPlayerVideo(data.cardMenu[i].widget)
      } else {
        returnStatement = true
      }
      if (returnStatement) {
        canBreak = true
      }
      i = i + 1
    }
    return returnStatement
  }
  return false
}

const checkSliderBanners = (widgetData: NsWidgetResolver.IRenderConfigWithAnyData): boolean => {
  const data = widgetData.widgetData
  if (data && data.length > 0) {
    let index = 0
    let canBreak = false
    let returnStatement = false
    while (index < data.length && !canBreak) {
      if (data[index].banners.l && data[index].banners.m && data[index].banners.s && data[index].banners.xl && data[index].banners.xs) {
        canBreak = true
        returnStatement = true
      }
      index = index + 1
    }
    return returnStatement
  }
  return false
}

const checkContentStripMultiple = (widgetData: NsWidgetResolver.IRenderConfigWithAnyData): boolean => {
  const data = widgetData.widgetData
  let index = 0
  if (data.strips.length > 0) {
    let canBreak = false
    let returnStatement = false
    while (index < data.strips.length && !canBreak) {
      if (Object.keys(data.strips[index]).length) {
        if (
          (data.strips[index].preWidgets && data.strips[index].preWidgets.length) ||
          (data.strips[index].postWidgets && data.strips[index].postWidgets.length) ||
          Object.keys(data.strips[index].request.searchV6 || {}).length
          || data.strips[index].request.ids && data.strips[index].request.ids.length
          || Object.keys(data.strips[index].request.api || {}).length
          || Object.keys(data.strips[index].request.search || {}).length
          || data.strips[index].request.manualData && data.strips[index].request.manualData.length > 0
          || Object.keys(data.strips[index].request.searchRegionRecommendation || {}).length) {
          canBreak = true
          returnStatement = true
        }
      }
      index = index + 1
    }
    return returnStatement
  }
  return false
}

const checkContentStripSingle = (widgetData: NsWidgetResolver.IRenderConfigWithAnyData): boolean => {
  const data = widgetData.widgetData
  if (Object.keys(data).length) {
    if (Object.keys(data.request.searchV6 || {}).length
      || data.request.ids && data.request.ids.length
      || Object.keys(data.request.api || {}).length
      || Object.keys(data.request.search || {}).length
      || data.request.manualData.length > 0
      || Object.keys(data.request.searchRegionRecommendation || {}).length) {
      return true
    }
  }
  return false
}

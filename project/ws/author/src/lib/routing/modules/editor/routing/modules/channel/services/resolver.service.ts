import { Injectable } from '@angular/core'
import { IGridLayoutDataMain, ISelectorResponsive, NsContentStripMultiple, NsGalleryView, NsWidgetLayoutTab } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { IWidgetAuthor, tDimensions, tSize } from '../interface/widget'

@Injectable()
export class ChannelResolverService {
  private currentIndex = 0
  constructor() { }

  private getUniqueId(): string {
    this.currentIndex += 1
    return (new Date().getTime() + this.currentIndex).toString()
  }

  renderFromJSON(
    data: NsWidgetResolver.IRenderConfigWithAnyData,
  ): { [key: string]: IWidgetAuthor } {
    const returnData = {} as any
    const recursiveFunc = (widget: NsWidgetResolver.IRenderConfigWithAnyData): string => {
      const id = this.getUniqueId()
      const returnWidget = this.basicConversionToIWidgetAuthor(widget)
      returnWidget.id = id
      returnWidget.widgetInstanceId = returnWidget.widgetInstanceId ? returnWidget.widgetInstanceId : id

      switch (widget.widgetSubType) {
        case 'gridLayout':
          const gridWidget: IGridLayoutDataMain = (widget as any).widgetData
          returnWidget.data = {
            gutter: gridWidget.gutter,
            fromBasicEditor: gridWidget.fromBasicEditor,
          }
          for (let x = 0; x < (gridWidget.widgets || []).length; x = x + 1) {
            for (let y = 0; y < ((gridWidget.widgets || [])[x] || []).length; y = y + 1) {
              const child = recursiveFunc(gridWidget.widgets[x][y].widget)
              returnData[child].parent = id
              returnData[child].dimensions = gridWidget.widgets[x][y].dimensions || {}
              returnData[child].className = gridWidget.widgets[x][y].className || ''
              returnData[child].styles = gridWidget.widgets[x][y].styles || {}
              returnData[child].rowNo = x
              returnWidget.children.push(child)
            }
          }
          break

        case 'linearLayout':
          const linearWidget: {
            widgets: NsWidgetResolver.IRenderConfigWithAnyData[]
          } = (widget as any).widgetData
          returnWidget.data = undefined as any
          linearWidget.widgets.forEach(v => {
            const child = recursiveFunc(v)
            returnData[child].parent = id
            returnWidget.children.push(child)
          })
          break

        case 'tabLayout':
          const tabWidget: NsWidgetLayoutTab.ILayout = (widget as any).widgetData
          returnWidget.data = undefined as any
          tabWidget.tabs.forEach(v => {
            const child = recursiveFunc(v.tabContent)
            returnData[child].parent = id
            returnData[child].addOnData = {
              tabKey: v.tabKey,
              tabTitle: v.tabTitle,
            }
            returnWidget.children.push(child)
          })
          break

        case 'selectorResponsive':
          const selectorWidget: ISelectorResponsive = (widget as any).widgetData
          returnWidget.data = {
            type: selectorWidget.type || '',
            subType: selectorWidget.subType || '',
          }
          selectorWidget.selectFrom.forEach(v => {
            const child = recursiveFunc(v.widget)
            returnData[child].parent = id
            returnData[child].addOnData = {
              minWidth: v.minWidth,
              maxWidth: v.maxWidth,
            }
            returnWidget.children.push(child)
          })
          break

        case 'galleryView':
          const galleryWidget: NsGalleryView.IWidgetGalleryView = (widget as any).widgetData
          returnWidget.data = {
            designVal: galleryWidget.designVal || '',
            autoNext: galleryWidget.autoNext || false,
            delay: galleryWidget.delay || 0,
            loop: galleryWidget.loop || false,
            configs: galleryWidget.configs || {},
            type: galleryWidget.type || '',
            subType: galleryWidget.subType || '',
          }
          galleryWidget.cardMenu.forEach(v => {
            const child = recursiveFunc(v.widget)
            returnData[child].parent = id
            returnData[child].addOnData = v.cardData || {}
            returnWidget.children.push(child)
          })
          break

        case 'contentStripMultiple':
          const contentStripWidget: NsContentStripMultiple.IContentStripMultiple = (widget as any)
            .widgetData
          returnWidget.data = {
            loader: contentStripWidget.loader || false,
            isChannelStrip: true,
          }
          if (contentStripWidget.noDataWidget) {
            const child = recursiveFunc(contentStripWidget.noDataWidget)
            returnData[child].parent = id
            returnData[child].purpose = 'noDataWidget'
            returnWidget.children.push(child)
          }
          if (contentStripWidget.errorWidget) {
            const child = recursiveFunc(contentStripWidget.errorWidget)
            returnData[child].parent = id
            returnData[child].purpose = 'errorWidget'
            returnWidget.children.push(child)
          }
          contentStripWidget.strips.forEach(v => {
            const child = this.basicConversionToIWidgetAuthor(v as any)
            child.widgetInstanceId = id
            const childId = this.getUniqueId()
            child.id = childId
            child.data = {
              key: v.key || '',
              title: v.title || '',
              stripConfig: v.stripConfig || {},
              filters: v.filters || [],
              request: v.request || {},
              loader: v.loader || false,
              searchV6Type: v.searchV6Type || null,
            }
            child.parent = id
            child.purpose = 'holder'
            if (v.info) {
              const childInfo = recursiveFunc(v.info.widget)
              returnData[childInfo].parent = childId
              returnData[childInfo].purpose = 'info'
              returnData[childInfo].addOnData = {
                mode: v.info.mode || 'below',
                visibilityMode: v.info.visibilityMode || 'visible',
                icon: v.info.icon || {},
              }
              child.children.push(childInfo)
            }
            if (v.noDataWidget) {
              const childNoWidget = recursiveFunc(v.noDataWidget)
              returnData[childNoWidget].parent = childId
              returnData[childNoWidget].purpose = 'noDataWidget'
              child.children.push(childNoWidget)
            }
            if (v.errorWidget) {
              const childErrWidget = recursiveFunc(v.errorWidget)
              returnData[childErrWidget].parent = childId
              returnData[childErrWidget].purpose = 'errorWidget'
              child.children.push(childErrWidget)
            }
            if (v.preWidgets && v.preWidgets.length) {
              v.preWidgets.forEach(preWidget => {
                const childPre = recursiveFunc(preWidget)
                returnData[childPre].parent = childId
                returnData[childPre].purpose = 'preWidget'
                child.children.push(childPre)
              })
            }
            if (v.postWidgets && v.postWidgets.length) {
              v.postWidgets.forEach(postWidget => {
                const childPost = recursiveFunc(postWidget)
                returnData[childPost].parent = childId
                returnData[childPost].purpose = 'postWidget'
                child.children.push(childPost)
              })
            }
            returnData[childId] = child
            returnWidget.children.push(childId)
          })
          break

        default:
          returnWidget.data = widget.widgetData || {}
      }
      returnData[id] = returnWidget
      return id
    }
    recursiveFunc(data)
    return returnData
  }

  renderToJSON(
    data: { [key: string]: IWidgetAuthor },
    parent?: string,
  ): NsWidgetResolver.IRenderConfigWithAnyData {
    const recursiveFunc = (id: string): NsWidgetResolver.IRenderConfigWithAnyData => {
      const returnWidget: any = {
        widgetSubType: data[id].widgetSubType,
        widgetType: data[id].widgetType,
        widgetInstanceId: data[id].widgetInstanceId,
        widgetHostClass: data[id].widgetHostClass,
        widgetHostStyle: data[id].widgetHostStyle,
      } as any

      switch (data[id].widgetSubType) {
        case 'gridLayout':
          (returnWidget as NsWidgetResolver.IWidgetData<IGridLayoutDataMain>).widgetData = {
            gutter: data[id].data.gutter,
            fromBasicEditor: data[id].data.fromBasicEditor,
            widgets: [] as any,
          }
          data[id].children.map(v => {
            if (returnWidget.widgetData.widgets[data[v].rowNo]) {
              returnWidget.widgetData.widgets[data[v].rowNo].push({
                dimensions: data[v].dimensions,
                widget: recursiveFunc(v),
                styles: data[v].styles,
                className: data[v].className,
              })
            } else {
              returnWidget.widgetData.widgets[data[v].rowNo] = [
                {
                  dimensions: data[v].dimensions,
                  widget: recursiveFunc(v),
                  styles: data[v].styles,
                  className: data[v].className,
                },
              ]
            }
          })
          break

        case 'linearLayout':
          (returnWidget as NsWidgetResolver.IWidgetData<{
            widgets: NsWidgetResolver.IRenderConfigWithAnyData[]
          }>).widgetData = {
            widgets: [] as any,
          }
          data[id].children.map(v => {
            returnWidget.widgetData.widgets.push({
              widget: recursiveFunc(v),
            })
          })
          break

        case 'tabLayout':
          (returnWidget as NsWidgetResolver.IWidgetData<NsWidgetLayoutTab.ILayout>).widgetData = {
            tabs: [] as any,
          }
          data[id].children.map(v => {
            returnWidget.widgetData.tabs.push({
              tabKey: data[v].addOnData.tabKey,
              tabTitle: data[v].addOnData.tabTitle,
              tabContent: recursiveFunc(v),
            })
          })
          break

        case 'selectorResponsive':
          (returnWidget as NsWidgetResolver.IWidgetData<ISelectorResponsive | null>).widgetData = {
            selectFrom: [] as any,
            type: data[id].data.type,
            subType: data[id].data.subType,
          }
          data[id].children.map(v => {
            (returnWidget as NsWidgetResolver.IWidgetData<
              ISelectorResponsive
            >).widgetData.selectFrom.push({
              minWidth: data[v].addOnData.minWidth,
              maxWidth: data[v].addOnData.maxWidth,
              widget: recursiveFunc(v),
            })
          })
          break

        case 'galleryView':
          (returnWidget as NsWidgetResolver.IWidgetData<
            NsGalleryView.IWidgetGalleryView
          >).widgetData = {
            designVal: data[id].data.designVal,
            configs: data[id].data.configs,
            cardMenu: [] as any,
            autoNext: data[id].data.autoNext,
            delay: data[id].data.delay,
            loop: data[id].data.loop,
            type: data[id].data.type,
            subType: data[id].data.subType,
          }
          data[id].children.map(v => {
            (returnWidget as NsWidgetResolver.IWidgetData<
              NsGalleryView.IWidgetGalleryView
            >).widgetData.cardMenu.push({
              widget: recursiveFunc(v),
              cardData: data[v].addOnData as any,
            })
          })
          break

        case 'contentStripMultiple':
          (returnWidget as NsWidgetResolver.IWidgetData<
            NsContentStripMultiple.IContentStripMultiple
          >).widgetData = {
            noDataWidget: undefined,
            loader: data[id].data.loader,
            errorWidget: undefined,
            strips: [] as any,
            isChannelStrip: true,
          }
          const noDataWidget = data[id].children.find(v => data[v].purpose === 'noDataWidget')
          if (noDataWidget) {
            returnWidget.widgetData.noDataWidget = recursiveFunc(noDataWidget)
          }
          const errorWidget = data[id].children.find(v => data[v].purpose === 'errorWidget')
          if (errorWidget) {
            returnWidget.widgetData.errorWidget = recursiveFunc(errorWidget)
          }
          data[id].children
            .filter(v => data[v].purpose !== '')
            .map(v => {
              const child: NsContentStripMultiple.IContentStripUnit = {
                ...(data[v].data as any),
                preWidgets: [] as any,
                postWidgets: [] as any,
              }
              data[v].children.map(childWidget => {
                switch (data[childWidget].purpose) {
                  case 'noDataWidget':
                    child.noDataWidget = recursiveFunc(childWidget)
                    break
                  case 'errorWidget':
                    child.errorWidget = recursiveFunc(childWidget)
                    break
                  case 'preWidget':
                    (child.preWidgets || []).push(recursiveFunc(childWidget))
                    break
                  case 'postWidget':
                    (child.postWidgets || []).push(recursiveFunc(childWidget))
                    break
                  case 'info':
                    child.info = {
                      ...(data[childWidget].addOnData as any),
                      widget: recursiveFunc(childWidget),
                    }
                    break
                }
              })
              returnWidget.widgetData.strips.push(child)
            })
          break

        default:
          returnWidget.widgetData = data[id].data
          break
      }
      return returnWidget
    }
    return parent
      ? recursiveFunc(parent)
      : recursiveFunc(Object.keys(data).find(v => !data[v].parent) as string)
  }

  private basicConversionToIWidgetAuthor(
    widget: NsWidgetResolver.IRenderConfigWithAnyData,
  ): IWidgetAuthor {
    return {
      addOnData: {},
      widgetType: widget.widgetType || '',
      widgetSubType: widget.widgetSubType || '',
      data: {} as any,
      dimensions: {} as Record<tDimensions, tSize>,
      widgetHostClass: widget.widgetHostClass || '',
      widgetHostStyle: widget.widgetHostStyle || {},
      widgetInstanceId: widget.widgetInstanceId || '',
      rowNo: 0,
      purpose: '',
      children: [] as any,
      className: '',
      styles: {},
      parent: '',
      isValid: true,
    } as any
  }
}

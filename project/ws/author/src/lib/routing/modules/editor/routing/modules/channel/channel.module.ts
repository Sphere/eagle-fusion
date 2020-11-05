import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { PickerContentModule } from '@ws-widget/collection/src/public-api'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { HorizontalScrollerModule } from '@ws-widget/utils'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { AuthViewerModule } from '@ws/author/src/lib/modules/viewer/viewer.module'
import { EditorSharedModule } from '@ws/author/src/lib/routing/modules/editor/shared/shared.module'
import { ChannelRoutingModule } from './channel-routing.module'
import { ChannelComponent } from './components/channel/channel.component'
import { AudioVideoComponent } from './components/input/audio-video/audio-video.component'
import { BreadcrumComponent } from './components/input/breadcrum/breadcrum.component'
import { ChipsComponent } from './components/input/chips/chips.component'
import { ContentStripInputComponent } from './components/input/content-strip-input/content-strip-input.component'
import { ContentStripMultipleComponent } from './components/input/content-strip-multiple/content-strip-multiple.component'
import { EmbedComponent } from './components/input/embed/embed.component'
import { GalleryWidgetComponent } from './components/input/gallery-widget/gallery-widget.component'
import { HtmlComponent } from './components/input/html/html.component'
import { ImageMapComponent } from './components/input/image-map/image-map.component'
import { InputComponent } from './components/input/input/input.component'
import { SliderComponent } from './components/input/slider/slider.component'
import { PageEditorComponent } from './components/page-editor/page-editor.component'
import { TemplateComponent } from './components/template/template.component'
import { PageEditorV2Component } from './components/v2/page-editor-v2/page-editor-v2.component'
import { RendererV2Component } from './components/v2/renderer-v2/renderer-v2.component'
import { ViewerComponent } from './components/v2/viewer/viewer.component'
import { ContentStripHolderComponent } from './components/view/content-strip-holder/content-strip-holder.component'
import { ContentStripComponent } from './components/view/content-strip/content-strip.component'
import { GalleryComponent } from './components/view/gallery/gallery.component'
import { GridComponent } from './components/view/grid/grid.component'
import { LinearComponent } from './components/view/linear/linear.component'
import { RendererComponent } from './components/view/renderer/renderer.component'
import { SelectorResponsiveComponent } from './components/view/selector-responsive/selector-responsive.component'
import { TabComponent } from './components/view/tab/tab.component'
import { ImageV2Component } from './components/input/image-v2/image-v2.component'
import { ContentStripV2Component } from './components/input/content-strip-v2/content-strip-v2.component'
import { InputV2Component } from './components/v2/input-v2/input-v2.component'
import { HtmlV2Component } from './components/input/html-v2/html-v2.component'
import { ContentStripSingleComponent } from './components/input/content-strip-single/content-strip-single.component'
import { ImageGalleryComponent } from './components/input/image-gallery/image-gallery.component'
import { TitleComponent } from './components/input/title/title.component'
import { SelectorResponsiveV2Component } from './components/input/selector-responsive-v2/selector-responsive-v2.component'
import { GalleryV2Component } from './components/input/gallery-v2/gallery-v2.component'
import { SearchTemplateComponent } from './components/input/search-template/search-template.component'
import { ChannelResolverService } from './services/resolver.service'
import { MediaWrapperComponent } from './components/input/media-wrapper/media-wrapper.component'
import { IntranetSelectorComponent } from './components/input/intranet-selector/intranet-selector.component'
import { DraggableModule } from '../../../../../../directives/draggable/draggable.module'
@NgModule({
  declarations: [
    ChannelComponent,
    RendererComponent,
    PageEditorComponent,
    GridComponent,
    ContentStripComponent,
    ContentStripHolderComponent,
    LinearComponent,
    TabComponent,
    SelectorResponsiveComponent,
    GalleryComponent,
    InputComponent,
    ChipsComponent,
    BreadcrumComponent,
    AudioVideoComponent,
    HtmlComponent,
    EmbedComponent,
    ContentStripInputComponent,
    ImageMapComponent,
    SliderComponent,
    GalleryWidgetComponent,
    ContentStripMultipleComponent,
    TemplateComponent,
    PageEditorV2Component,
    RendererV2Component,
    ViewerComponent,
    ImageV2Component,
    ContentStripV2Component,
    InputV2Component,
    HtmlV2Component,
    ContentStripSingleComponent,
    ImageGalleryComponent,
    TitleComponent,
    SelectorResponsiveV2Component,
    GalleryV2Component,
    SearchTemplateComponent,
    MediaWrapperComponent,
    IntranetSelectorComponent,
  ],
  imports: [
    CommonModule,
    ChannelRoutingModule,
    SharedModule,
    EditorSharedModule,
    AuthViewerModule,
    WidgetResolverModule,
    HorizontalScrollerModule,
    DragDropModule,
    PickerContentModule,
    DraggableModule,
  ],
  providers: [ChannelResolverService],
  entryComponents: [InputComponent, InputV2Component],
})
export class ChannelModule {}

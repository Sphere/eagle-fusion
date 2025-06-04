import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GridLayoutComponent } from './grid-layout.component'
import { WidgetResolverModule } from '@ws-widget/resolver'

@NgModule({
    declarations: [GridLayoutComponent],
    imports: [CommonModule, WidgetResolverModule],
    exports: [GridLayoutComponent]
})
export class GridLayoutModule { }

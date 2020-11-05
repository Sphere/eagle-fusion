import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DraggableDirective } from './draggable.directive'
import { DraggableHelperDirective } from './draggable-helper.directive'
import { SortableDirective } from './sortable.directive'
import { SortableListDirective } from './sortable-list.directive'
import { ScrollHelperService } from './scroll-helper.service'

@NgModule({
  declarations: [
    DraggableDirective,
    DraggableHelperDirective,
    SortableDirective,
    SortableListDirective,
  ],
  imports: [CommonModule],
  providers: [ScrollHelperService],
  exports: [DraggableDirective, SortableDirective, SortableListDirective, DraggableHelperDirective],
})
export class DraggableModule { }

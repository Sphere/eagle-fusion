import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardDetailsComponent } from './card-details.component'
import { RouterModule } from '@angular/router'
import { MatDividerModule } from '@angular/material/divider'

@NgModule({
    declarations: [CardDetailsComponent],
    imports: [
        CommonModule,
        RouterModule,
        MatDividerModule,
    ],
    exports: [CardDetailsComponent]
})

export class CardDetailsModule { }

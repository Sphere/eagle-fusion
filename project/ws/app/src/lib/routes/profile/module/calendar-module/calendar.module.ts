import { NgModule } from '@angular/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { CalendarComponent } from './calendar.component'

@NgModule({
  declarations: [CalendarComponent],
  imports: [MatDatepickerModule, MatNativeDateModule],
  providers: [MatDatepickerModule],
  exports: [CalendarComponent],
})
export class CalendarModule { }

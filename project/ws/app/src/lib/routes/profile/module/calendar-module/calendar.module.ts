import { NgModule } from '@angular/core'
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material'
import { CalendarComponent } from './calendar.component'

@NgModule({
  declarations: [CalendarComponent],
  imports: [MatDatepickerModule, MatNativeDateModule],
  providers: [MatDatepickerModule],
  exports: [CalendarComponent],
})
export class CalendarModule {}

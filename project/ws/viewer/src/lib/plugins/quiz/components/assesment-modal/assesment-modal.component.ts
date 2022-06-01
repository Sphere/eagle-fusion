import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { interval, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'viewer-assesment-modal',
  templateUrl: './assesment-modal.component.html',
  styleUrls: ['./assesment-modal.component.scss'],
})
export class AssesmentModalComponent implements OnInit {

  timeLeft = 0;
  startTime = 0;
  tabIndex = 1;
  isIdeal = false;
  timerSubscription: Subscription | null = null
  constructor(
    public dialogRef: MatDialogRef<AssesmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
  ) { }

  ngOnInit() {
    console.log("data", this.assesmentdata)

    this.timeLeft = this.assesmentdata.questions.timeLimit
    this.startTime = Date.now()
    console.log()
    this.timer(this.timeLeft)
  }


  timer(data: any) {
    if (data > -1) {
      this.timerSubscription = interval(100)
        .pipe(
          map(
            () =>
              this.startTime + this.assesmentdata.questions.timeLimit - Date.now(),
          ),
        )
        .subscribe(_timeRemaining => {
          this.timeLeft -= 0.1
          if (this.timeLeft < 0) {
            this.isIdeal = true
            this.timeLeft = 0
            if (this.timerSubscription) {
              this.timerSubscription.unsubscribe()
            }
            // this.submitQuiz()
            this.tabIndex = 1
            console.log("time out")
          }
        })
    }
  }

}

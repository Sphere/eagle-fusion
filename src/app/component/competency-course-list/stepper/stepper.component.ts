import { Component, Input, OnInit } from '@angular/core'

@Component({
  standalone: false,
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
})
export class StepperComponent implements OnInit {
  @Input() levels: number[] = []
  @Input() completedLevels: number[] = []
  @Input() failedLevels: number[] = []
  @Input() currentLevel!: number
  constructor() {

  }
  ngOnInit() {
    console.log("stepper data", this.levels, this.completedLevels, this.failedLevels, this.currentLevel)
  }

}
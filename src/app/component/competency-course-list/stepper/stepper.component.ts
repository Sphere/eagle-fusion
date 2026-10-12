import { Component, Input, OnInit } from '@angular/core'
import { LoggerService } from '@ws-widget/utils'

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
  constructor(private readonly logger: LoggerService) {
    // Intentionally empty
  }
  ngOnInit() {
    this.logger.log('stepper data', this.levels, this.completedLevels, this.failedLevels, this.currentLevel)
  }

}
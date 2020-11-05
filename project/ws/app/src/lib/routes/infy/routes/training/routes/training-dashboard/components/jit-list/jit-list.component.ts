import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { IJITRequest } from '../../../../models/training-api.model'
import { TrainingApiService } from '../../../../apis/training-api.service'

@Component({
  selector: 'ws-app-jit-list',
  templateUrl: './jit-list.component.html',
  styleUrls: ['./jit-list.component.scss'],
})
export class JitListComponent implements OnInit {
  jitRequests!: IJITRequest[]
  fetchStatus: 'fetching' | 'done' = 'fetching'
  selectedView: 'trainings' | 'jit' = 'trainings'

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private trainingsApi: TrainingApiService,
  ) {}

  ngOnInit() {
    this.getJITRequests()
  }

  getJITRequests() {
    this.fetchStatus = 'fetching'

    this.trainingsApi.getJITRequests().subscribe(
      requests => {
        this.jitRequests = requests
        this.fetchStatus = 'done'
      },
      () => {
        this.jitRequests = []
        this.fetchStatus = 'done'
      },
    )
  }

  openJITForm() {
    this.router.navigate(['../request-training'], { relativeTo: this.route })
  }
}

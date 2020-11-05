import { Component, OnInit, Input } from '@angular/core'
import { IWsToDoListResponse, IWsToDoListRequest } from '../../models/ocm.model'
import { OcmService } from '../../services/ocm.service'

@Component({
  selector: 'ws-app-to-do-list',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.scss'],
})
export class ToDoListComponent implements OnInit {
  @Input() config: IWsToDoListRequest = {
    title: '',
    toDoId: '',
  }
  fetchingInProgress = false
  toDoList: IWsToDoListResponse[] = []
  constructor(private ocmSvc: OcmService) {}

  ngOnInit() {
    if (this.config && this.config.toDoId) {
      this.fetchToDos(this.config.toDoId)
    }
  }

  fetchToDos(id: string) {
    this.fetchingInProgress = true
    this.ocmSvc.fetchToDos(id).subscribe((data: IWsToDoListResponse[]) => {
      this.toDoList = data
    })
    this.fetchingInProgress = false
  }
}

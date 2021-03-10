import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Router } from '@angular/router'
import { ICreateEntity } from '@ws/author/src/lib/interface/create-entity'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'

@Component({
  selector: 'ws-auth-entity-card',
  templateUrl: './entity-card.component.html',
  styleUrls: ['./entity-card.component.scss'],
})
export class EntityCardComponent implements OnInit {
  @Input() entity!: ICreateEntity
  @Input() expanded!: boolean
  @Output() step = new EventEmitter<any>()
  childEntity: ICreateEntity[] = []
  resourceClicked = false
  notEnabled = true

  constructor(private authInitService: AuthInitService, private router: Router) { }

  ngOnInit() {
    this.authInitService.creationEntity.forEach(v => {
      if (v.parent === this.entity.id) {
        this.childEntity.push(v)
      }
    })
    this.resourceClicked = this.expanded
    this.notEnabled = !this.entity.enabled
  }

  entityClicked(content: ICreateEntity) {
    if (content.url) {
      this.router.navigateByUrl(content.url)
    } else if (content.name === 'Resource') {
      this.resourceClicked = !this.resourceClicked
    } else if (!this.notEnabled) {
      this.step.emit(content)
    }
  }
}

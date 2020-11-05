import { Component, OnInit, Input } from '@angular/core'
import { ICertificationEligibility } from '../../models/certification.model'

@Component({
  selector: 'ws-app-certification-eligibility',
  templateUrl: './certification-eligibility.component.html',
  styleUrls: ['./certification-eligibility.component.scss'],
})
export class CertificationEligibilityComponent implements OnInit {
  @Input() eligibility!: ICertificationEligibility

  constructor() {}

  ngOnInit() {}
}

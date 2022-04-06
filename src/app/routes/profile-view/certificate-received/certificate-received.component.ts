import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-certificate-received',
  templateUrl: './certificate-received.component.html',
  styleUrls: ['./certificate-received.component.scss']
})
export class CertificateReceivedComponent implements OnInit {
  @Input() certificateData?: any
  constructor() { }

  ngOnInit() {
    console.log(this.certificateData)
  }

}

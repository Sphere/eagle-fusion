import { Component, OnInit, ViewChild } from '@angular/core'
import { LoginRootDirective } from './login-root.directive'
import { LoginRootService } from './login-root.service'

@Component({
    standalone: false,
    selector: 'ws-login-root',
    templateUrl: './login-root.component.html',
    styleUrls: ['./login-root.component.scss'],
    
})
export class LoginRootComponent implements OnInit {

  @ViewChild(LoginRootDirective, { static: true }) wsLoginRoot!: LoginRootDirective
  constructor(
    private loginRootSvc: LoginRootService,
  ) { }

  loadComponent() {
    const viewContainerRef = this.wsLoginRoot.viewContainerRef
    viewContainerRef.clear()
    viewContainerRef.createComponent(this.loginRootSvc.getComponent())
  }

  ngOnInit() {
    this.loadComponent()
  }

}

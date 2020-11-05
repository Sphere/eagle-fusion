import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core'
import { LoginRootDirective } from './login-root.directive'
import { LoginRootService } from './login-root.service'

@Component({
  selector: 'ws-login-root',
  templateUrl: './login-root.component.html',
  styleUrls: ['./login-root.component.scss'],
})
export class LoginRootComponent implements OnInit {

  @ViewChild(LoginRootDirective, { static: true }) wsLoginRoot!: LoginRootDirective
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private loginRootSvc: LoginRootService,
  ) { }

  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.loginRootSvc.getComponent())
    const viewContainerRef = this.wsLoginRoot.viewContainerRef
    viewContainerRef.clear()
    viewContainerRef.createComponent(componentFactory)
  }

  ngOnInit() {
    this.loadComponent()
  }

}

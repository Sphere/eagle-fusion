import { NgModule } from '@angular/core'
import { ServerModule } from '@angular/platform-server'
import { AppModule } from './app.module'
import { RootComponent } from './component/root/root.component'

@NgModule({
  imports: [
    AppModule,
    ServerModule,
  ],
  bootstrap: [RootComponent],
})
export class AppServerModule {}

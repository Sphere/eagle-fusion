import { NgModule } from '@angular/core'
import { ServerModule } from '@angular/platform-server'
import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { AppModule } from './app.module'
import { RootComponent } from './component/root/root.component'
import { PrerenderHttpInterceptor } from './services/prerender-http.interceptor'

@NgModule({
  imports: [
    AppModule,
    ServerModule,
  ],
  bootstrap: [RootComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PrerenderHttpInterceptor,
      multi: true,
    },
  ],
})
export class AppServerModule {}

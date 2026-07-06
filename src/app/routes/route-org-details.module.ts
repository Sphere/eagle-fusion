import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OrgModule } from './../../../project/ws/app/src/lib/routes/org/org.module'

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        OrgModule,
    ],
    exports: [
        OrgModule,
    ],
})
export class RouteOrgDetailsModule { }

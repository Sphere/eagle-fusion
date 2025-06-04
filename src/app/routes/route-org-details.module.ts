import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OrgModule } from './../../../project/ws/app/src/lib/routes/org/org.module'
// import { OrgComponent } from '../../../project/ws/app/src/lib/routes/org/components/org/org.component'

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        OrgModule,
    ],
    exports: [
        OrgModule,
    ]
})
export class RouteOrgDetailsModule { }

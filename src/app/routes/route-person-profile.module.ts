import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PersonProfileModule } from '../../../project/ws/app/src/lib/routes/person-profile/person-profile.module'
import { UserdetailallComponent } from '../../../project/ws/app/src/lib/routes/person-profile/components/userdetailall/userdetailall.component'

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        PersonProfileModule,
    ],
    exports: [
        PersonProfileModule,
    ]
})
export class RoutePersonProfileModule { }

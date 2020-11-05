import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { AuthTableTreeLabelComponent } from './auth-table-tree-label.component'

describe('AuthTableTreeLabelComponent', () => {
  let component: AuthTableTreeLabelComponent
  let fixture: ComponentFixture<AuthTableTreeLabelComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthTableTreeLabelComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthTableTreeLabelComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})

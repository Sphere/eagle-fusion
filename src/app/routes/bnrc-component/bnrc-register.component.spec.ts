import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BnrcRegisterComponent } from './bnrc-register.component'

describe('BnrcRegisterComponent', () => {
  let component: BnrcRegisterComponent
  let fixture: ComponentFixture<BnrcRegisterComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BnrcRegisterComponent]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(BnrcRegisterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})

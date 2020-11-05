import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IapAssessmentComponent } from './iap-assessment.component'

describe('IapAssessmentComponent', () => {
  let component: IapAssessmentComponent
  let fixture: ComponentFixture<IapAssessmentComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IapAssessmentComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IapAssessmentComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})

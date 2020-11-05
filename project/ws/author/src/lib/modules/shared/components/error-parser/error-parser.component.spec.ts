import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ErrorParserComponent } from './error-parser.component'

describe('ErrorParserComponent', () => {
  let component: ErrorParserComponent
  let fixture: ComponentFixture<ErrorParserComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorParserComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorParserComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})

import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MyforumPostComponent } from './myforum-post.component'

describe('MyforumPostComponent', () => {
  let component: MyforumPostComponent
  let fixture: ComponentFixture<MyforumPostComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyforumPostComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MyforumPostComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})

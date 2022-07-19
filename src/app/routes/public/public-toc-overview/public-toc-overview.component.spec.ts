import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicTocOverviewComponent } from './public-toc-overview.component';

describe('PublicTocOverviewComponent', () => {
  let component: PublicTocOverviewComponent;
  let fixture: ComponentFixture<PublicTocOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicTocOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicTocOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

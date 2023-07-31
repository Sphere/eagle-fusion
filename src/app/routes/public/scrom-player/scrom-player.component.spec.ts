import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScromPlayerComponent } from './scrom-player.component';

describe('ScromPlayerComponent', () => {
  let component: ScromPlayerComponent;
  let fixture: ComponentFixture<ScromPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScromPlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScromPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

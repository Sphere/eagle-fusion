import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileVideoPlayerComponent } from './mobile-video-player.component';

describe('MobileVideoPlayerComponent', () => {
  let component: MobileVideoPlayerComponent;
  let fixture: ComponentFixture<MobileVideoPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileVideoPlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileVideoPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

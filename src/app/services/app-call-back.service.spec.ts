import { TestBed } from '@angular/core/testing';

import { AppCallBackService } from './app-call-back.service';

describe('AppCallBackService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppCallBackService = TestBed.get(AppCallBackService);
    expect(service).toBeTruthy();
  });
});

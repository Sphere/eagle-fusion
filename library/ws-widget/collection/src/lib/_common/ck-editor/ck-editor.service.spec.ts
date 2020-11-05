import { TestBed } from '@angular/core/testing'

import { CkEditorService } from './ck-editor.service'

describe('CkEditorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: CkEditorService = TestBed.get(CkEditorService)
    expect(service).toBeTruthy()
  })
})

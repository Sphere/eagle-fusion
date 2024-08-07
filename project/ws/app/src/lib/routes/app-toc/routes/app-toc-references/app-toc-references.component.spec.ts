import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, Data } from '@angular/router'
import { of } from 'rxjs'
import { AppTocService } from '../../services/app-toc.service'
import { AppTocReferencesComponent } from './app-toc-references.component'
import { NO_ERRORS_SCHEMA } from '@angular/core'

describe('AppTocReferencesComponent', () => {
  let component: AppTocReferencesComponent
  let fixture: ComponentFixture<AppTocReferencesComponent>
  let tocSharedSvc: AppTocService

  const mockActivatedRoute = {
    parent: {
      data: of({
        content: {
          references: JSON.stringify([{ id: 'ref1' }, { id: 'ref2' }]),
        },
      }),
    },
  }

  const mockTocSharedSvc = {
    initData: jest.fn().mockReturnValue({
      content: {
        references: JSON.stringify([{ id: 'ref1' }, { id: 'ref2' }]),
      },
    }),
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppTocReferencesComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AppTocService, useValue: mockTocSharedSvc },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(AppTocReferencesComponent)
    component = fixture.componentInstance
    tocSharedSvc = TestBed.get(AppTocService)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize data on init', () => {
    expect(tocSharedSvc.initData).toHaveBeenCalled()
    expect(component.content).toEqual({
      references: JSON.stringify([{ id: 'ref1' }, { id: 'ref2' }]),
    })
    expect(component.references).toEqual([{ id: 'ref1' }, { id: 'ref2' }])
  })

  it('should have references as an array', () => {
    expect(Array.isArray(component.references)).toBe(true)
  })

  it('should render references correctly', () => {
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    expect(compiled.querySelectorAll('ws-app-toc-content-card').length).toBe(2)
  })


  it('should parse references JSON correctly', () => {
    const references = '[{"id":"ref1"},{"id":"ref2"}]'
    component.content = { references }
    component.initData({} as Data)
    expect(component.references).toEqual([{ id: 'ref1' }, { id: 'ref2' }])
  })

  it('should handle route parent data subscription', () => {
    expect(component.routeSubscription).toBeTruthy()
  })

  it('should set loadContent to true initially', () => {
    expect(component.loadContent).toBe(true)
  })

  it('should call initData on route data change', () => {
    const initDataSpy = jest.spyOn(component as any, 'initData')
    mockActivatedRoute.parent.data = of({ content: { references: '[]' } })
    component.ngOnInit()
    expect(initDataSpy).toHaveBeenCalled()
  })




  it('should handle null routeSubscription on destroy', () => {
    component.routeSubscription = null
    expect(() => component.ngOnDestroy()).not.toThrow()
  })

  it('should not throw error if references are already initialized', () => {
    component.references = [{ id: 'ref1' }]
    expect(() => component.ngOnInit()).not.toThrow()
  })

})

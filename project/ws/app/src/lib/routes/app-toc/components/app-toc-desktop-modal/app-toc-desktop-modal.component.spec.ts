import { MatDialogRef } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { LoggerService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'
import { AppTocDesktopModalComponent } from './app-toc-desktop-modal.component'

const mockDialogRef: Partial<MatDialogRef<AppTocDesktopModalComponent>> = {
  close: jest.fn(),
}

const mockRouter: Partial<Router> = {
  navigate: jest.fn(),
}

const mockLogger: Partial<LoggerService> = {
  log: jest.fn(),
}

function createComponent(content: any): AppTocDesktopModalComponent {
  return new AppTocDesktopModalComponent(
    mockDialogRef as MatDialogRef<AppTocDesktopModalComponent>,
    mockRouter as Router,
    content,
    mockLogger as LoggerService,
  )
}

describe('AppTocDesktopModalComponent', () => {
  let component: AppTocDesktopModalComponent

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    component = createComponent({ type: 'OTHER' })
    expect(component).toBeTruthy()
  })

  it('should populate competencyData on init when type is COMPETENCY', () => {
    const competency = JSON.stringify([{ competencyName: 'Leadership', level: 2 }])
    component = createComponent({ type: 'COMPETENCY', competency })
    component.ngOnInit()
    expect(component.cometencyData).toEqual([{ name: 'Leadership', levels: ' Level 2' }])
  })

  it('should not populate competencyData on init when type is not COMPETENCY', () => {
    component = createComponent({ type: 'OTHER' })
    component.ngOnInit()
    expect(component.cometencyData).toEqual([])
  })

  it('should default to "Levels data not found!" when level is missing', () => {
    const competency = JSON.stringify([{ competencyName: 'Empathy' }])
    component = createComponent({ type: 'COMPETENCY', competency })
    const result = component.competencyData(competency)
    expect(result).toEqual([{ name: 'Empathy', levels: 'Levels data not found!' }])
  })

  it('should close dialog and navigate on showOrgprofile', () => {
    component = createComponent({ type: 'OTHER' })
    component.showOrgprofile('org-1')
    expect(mockDialogRef.close).toHaveBeenCalled()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/org-details'], { queryParams: { orgId: 'org-1' } })
  })
})

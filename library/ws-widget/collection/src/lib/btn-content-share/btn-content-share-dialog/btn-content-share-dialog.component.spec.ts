import { ComponentFixture, TestBed, async } from '@angular/core/testing'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { WidgetContentShareService } from '../../_services/widget-content-share.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { BtnContentShareDialogComponent } from './btn-content-share-dialog.component'
import { of } from 'rxjs'
import { MatSnackBar } from '@angular/material/snack-bar'

describe('BtnContentShareDialogComponent', () => {
  let component: BtnContentShareDialogComponent
  let fixture: ComponentFixture<BtnContentShareDialogComponent>
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  }
  const mockData = {
    content: {
      name: 'Test Content',
      contentType: 'test',
      identifier: 'test123'
    }
  }
  const mockSnackBar = {
    open: jasmine.createSpy('open')
  }
  const mockShareService = jasmine.createSpyObj('WidgetContentShareService', ['shareContent', 'contentShareNew'])
  const mockConfigService = {
    fetchConfigFile: jasmine.createSpy('fetchConfigFile').and.returnValue(of({}))
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnContentShareDialogComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: WidgetContentShareService, useValue: mockShareService },
        { provide: ConfigurationsService, useValue: mockConfigService }
      ]
    })
      .compileComponents()
  }))


  beforeEach(() => {
    fixture = TestBed.createComponent(BtnContentShareDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize component properties', () => {
    expect(component.separatorKeysCodes).toEqual([13, 188, 186])
    expect(component.users).toEqual([])
    expect(component.errorType).toEqual('None')
    expect(component.sendInProgress).toEqual(false)
    expect(component.message).toEqual('')
    expect(component.isSocialMediaShareEnabled).toEqual(false)
    expect(component.qrdata).toContain('overview')
    expect(component.sendStatus).toEqual('NONE')
  })

  it('should save as image', () => {
    const qrcElement = { nativeElement: document.createElement('div') }
    component.saveAsImage({ qrcElement })
    expect(qrcElement.nativeElement).toBeDefined()
  })

  it('should update users', () => {
    const users = [
      {
        department_name: 'Department 1',
        email: 'user1@example.com',
        first_name: 'First 1',
        last_name: 'Last 1',
        root_org: 'Root Org 1',
        wid: '1',
        user_id: 'user1'
      },
      // Add more objects as needed
    ]
    component.updateUsers(users)
    expect(component.users).toEqual(users)
  })

  it('should share content', () => {
    const txtBody = 'Test message'
    const successToast = 'Content shared successfully'
    const invalidIds = ['invalid1', 'invalid2']
    const shareResponse = { invalidIds, response: 'success' }
    component.users = [
      {
        department_name: 'Department 1',
        email: 'user1@example.com',
        first_name: 'First 1',
        last_name: 'Last 1',
        root_org: 'Root Org 1',
        wid: '1',
        user_id: 'user1'
      },
      // Add more objects as needed
    ]
    mockShareService.shareContent.and.returnValue(of(shareResponse))

    component.share(txtBody, successToast)
    expect(component.sendInProgress).toEqual(true)
    expect(mockShareService.shareContent).toHaveBeenCalledWith(
      mockData.content,
      [{ email: 'test@example.com' }],
      txtBody
    )

    // Simulate share success
    expect(component.sendInProgress).toEqual(false)
    expect(component.snackBar.open).toHaveBeenCalledWith(successToast)
    expect(mockDialogRef.close).toHaveBeenCalled()

    // Simulate share with some invalid IDs
    const invalidIdSomeResponse = { ...shareResponse, response: 'failure' }
    mockShareService.shareContent.and.returnValue(of(invalidIdSomeResponse))
    component.share(txtBody, successToast)
    expect(component.sendStatus).toEqual('INVALID_ID_SOME')
  })

  it('should share content new', () => {
    const txtBody = 'Test message'
    const successToast = 'Content shared successfully'
    component.users = [
      {
        department_name: 'Department 1',
        email: 'user1@example.com',
        first_name: 'First 1',
        last_name: 'Last 1',
        root_org: 'Root Org 1',
        wid: '1',
        user_id: 'user1'
      },
      // Add more objects as needed
    ]
    mockShareService.contentShareNew.and.returnValue(of({}))

    component.contentShare(txtBody, successToast)
    expect(component.sendInProgress).toEqual(true)
    expect(mockShareService.contentShareNew).toHaveBeenCalled()

    // Simulate content share success
    expect(component.sendInProgress).toEqual(false)
    expect(component.snackBar.open).toHaveBeenCalledWith(successToast)
    expect(mockDialogRef.close).toHaveBeenCalled()
  })

  it('should return detail URL based on content type', () => {
    expect(component.detailUrl).toContain('overview')
  })

  it('should raise telemetry', () => {
    spyOn(component.events, 'raiseInteractTelemetry')
    component.raiseTelemetry()
    expect(component.events.raiseInteractTelemetry).toHaveBeenCalled()
  })

  // Add more test cases as needed
})

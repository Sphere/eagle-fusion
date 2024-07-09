import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Renderer2 } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { CreateAccountDialogComponent } from './create-account-dialog.component'

describe('CreateAccountDialogComponent', () => {
  let component: CreateAccountDialogComponent
  let fixture: ComponentFixture<CreateAccountDialogComponent>
  let renderer2Mock: any
  let documentMock: any
  let dialogRefMock: any

  beforeEach(async () => {
    renderer2Mock = {
      createElement: jest.fn().mockReturnValue({}),
      appendChild: jest.fn(),
    }

    documentMock = {
      body: {},
    }

    dialogRefMock = {
      close: jest.fn(),
    }

    await TestBed.configureTestingModule({
      declarations: [CreateAccountDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: Renderer2, useValue: renderer2Mock },
        { provide: DOCUMENT, useValue: documentMock },
      ],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAccountDialogComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with selectedData as "help"', () => {
    component.selectedData = { selected: 'help' }
    component.ngOnInit()
    expect(component.name).toBe('help')
  })

  it('should initialize with selectedData as "name"', () => {
    component.selectedData = { selected: 'name', details: { firstname: 'John', lastname: 'Doe' } }
    component.ngOnInit()
    expect(component.firstName).toBe('John')
    expect(component.lastName).toBe('Doe')
  })

  it('should call showSocialChats when selectedData is "help"', () => {
    const showSocialChatsSpy = jest.spyOn(component, 'showSocialChats')
    component.selectedData = { selected: 'help' }
    component.ngOnInit()
    expect(showSocialChatsSpy).toHaveBeenCalled()
  })

  // it('should set up social chat scripts', (done) => {
  //   window.fcWidget = {
  //     init: jest.fn(),
  //     setConfig: jest.fn(),
  //   }

  //   component.showSocialChats()
  //   setTimeout(() => {
  //     expect(window.fcWidget.init).toHaveBeenCalled()
  //     expect(window.fcWidget.setConfig).toHaveBeenCalledWith({ headerProperty: { hideChatButton: false } })
  //     done()
  //   }, 500)
  // })

  it('should append chat script to document body', () => {
    component.showSocialChats()
    expect(renderer2Mock.createElement).toHaveBeenCalledWith('script')
    expect(renderer2Mock.appendChild).toHaveBeenCalledWith(documentMock.body, {})
  })

  // it('should call backToChatIcon correctly', () => {
  //   window.fcWidget = {
  //     setConfig: jest.fn(),
  //     init: jest.fn(),
  //   }
  //   component.backToChatIcon()
  //   expect(window.fcWidget.setConfig).toHaveBeenCalledWith({ headerProperty: { hideChatButton: true } })
  //   expect(window.fcWidget.init).toHaveBeenCalled()
  // })

  // it('should log error in backToChatIcon', () => {
  //   window.fcWidget = null
  //   const consoleSpy = jest.spyOn(console, 'log')
  //   component.backToChatIcon()
  //   expect(consoleSpy).toHaveBeenCalled()
  // })

  it('should confirm with correct data', () => {
    const data = 'test data'
    component.confirm(data)
    expect(dialogRefMock.close).toHaveBeenCalledWith(data)
  })

  it('should render correct template for name', () => {
    component.selectedData = { selected: 'name', details: { firstname: 'John', lastname: 'Doe' } }
    component.ngOnInit()
    fixture.detectChanges()
    const compiled = fixture.debugElement.nativeElement
    expect(compiled.querySelector('.firstName').textContent).toContain('John Doe')
  })

  it('should render correct template for userExist', () => {
    component.selectedData = { selected: 'userExist' }
    component.ngOnInit()
    fixture.detectChanges()
    const compiled = fixture.debugElement.nativeElement
    expect(compiled.querySelector('.exist').textContent).toContain('User already exists.')
  })

  it('should render correct template for userNotExist', () => {
    component.selectedData = { selected: 'userNotExist' }
    component.ngOnInit()
    fixture.detectChanges()
    const compiled = fixture.debugElement.nativeElement
    expect(compiled.querySelector('.exist').textContent).toContain('User doesn’t exist.')
  })

  it('should render correct template for help', () => {
    component.selectedData = { selected: 'help' }
    component.ngOnInit()
    fixture.detectChanges()
    const compiled = fixture.debugElement.nativeElement
    expect(compiled.querySelector('.exist').textContent).toContain('Aastrika Sphere chat support')
  })

  it('should call confirm with "edit" on Edit name button click', () => {
    component.selectedData = { selected: 'name', details: { firstname: 'John', lastname: 'Doe' } }
    component.ngOnInit()
    fixture.detectChanges()
    const button = fixture.debugElement.nativeElement.querySelector('button.btn-edit')
    button.click()
    expect(dialogRefMock.close).toHaveBeenCalledWith('edit')
  })

  it('should call confirm with "confirm" on Confirm name button click', () => {
    component.selectedData = { selected: 'name', details: { firstname: 'John', lastname: 'Doe' } }
    component.ngOnInit()
    fixture.detectChanges()
    const button = fixture.debugElement.nativeElement.querySelector('button.btn-confirm')
    button.click()
    expect(dialogRefMock.close).toHaveBeenCalledWith('confirm')
  })

  it('should call confirm with "again" on Try again button click for userExist', () => {
    component.selectedData = { selected: 'userExist' }
    component.ngOnInit()
    fixture.detectChanges()
    const button = fixture.debugElement.nativeElement.querySelector('button.btn-edit')
    button.click()
    expect(dialogRefMock.close).toHaveBeenCalledWith('again')
  })

  it('should call confirm with "login" on Login button click for userExist', () => {
    component.selectedData = { selected: 'userExist' }
    component.ngOnInit()
    fixture.detectChanges()
    const button = fixture.debugElement.nativeElement.querySelector('button.btn-confirm')
    button.click()
    expect(dialogRefMock.close).toHaveBeenCalledWith('login')
  })

  it('should call confirm with "again" on Try again button click for userNotExist', () => {
    component.selectedData = { selected: 'userNotExist' }
    component.ngOnInit()
    fixture.detectChanges()
    const button = fixture.debugElement.nativeElement.querySelector('button.btn-edit')
    button.click()
    expect(dialogRefMock.close).toHaveBeenCalledWith('again')
  })

  it('should call confirm with "createAccount" on Create account button click for userNotExist', () => {
    component.selectedData = { selected: 'userNotExist' }
    component.ngOnInit()
    fixture.detectChanges()
    const button = fixture.debugElement.nativeElement.querySelector('button.btn-confirm')
    button.click()
    expect(dialogRefMock.close).toHaveBeenCalledWith('createAccount')
  })

  it('should call showSocialChats on clicking chat button', () => {
    const showSocialChatsSpy = jest.spyOn(component, 'showSocialChats')
    component.selectedData = { selected: 'help' }
    component.ngOnInit()
    fixture.detectChanges()
    const button = fixture.debugElement.nativeElement.querySelector('a.fcapp-text')
    button.click()
    expect(showSocialChatsSpy).toHaveBeenCalled()
  })
})

import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core'
import { MatPaginator, MatTableDataSource, MatSnackBar } from '@angular/material'
import { IScheduleDataResponse, IDateObj, IScheduleData, IScheduleObj, IRegisterObj } from '../../../../models/training-schedules.model'
import { TFetchStatus } from '@ws-widget/utils'
import {
  FormGroup,
  FormBuilder,
} from '@angular/forms'
import { TrainingApiService } from '../../../../apis/training-api.service'
import { ITrainingApiResponse } from '../../../../models/training-api.model'

export interface IScheduleTable {
  courseTitle: string
  startDate: Date
  endDate: Date
  location: string
  register: string
}
@Component({
  selector: 'ws-app-training-schedule',
  templateUrl: './training-schedule.component.html',
  styleUrls: ['./training-schedule.component.scss'],
})
export class TrainingScheduleComponent implements OnInit, AfterViewInit {
  scheduleForm: FormGroup
  searchForm: FormGroup
  displayedColumns: string[] = [
    'courseTitle',
    'startDate',
    'endDate',
    'location',
    'register',
  ]
  scheduleFetchStatus: TFetchStatus = 'fetching'
  dateStart = ''
  dateEnd = ''
  isRegister = false
  dateObj: IDateObj = {} as IDateObj
  scheduleObj: IScheduleObj = {} as IScheduleObj
  registerObj: IRegisterObj = {} as IRegisterObj
  year = 0
  endDateMonth = (new Date().getMonth() + 2) === 13 ? 1 : new Date().getMonth() + 2
  endYear = (new Date().getMonth() + 2) === 13 ? this.year = new Date().getFullYear() + 1 : this.year = new Date().getFullYear()
  startDateInitial = `${new Date().getFullYear()}-${`0${new Date().getMonth() + 1}`.slice(-2)}-${`0${new Date().getDate()}`.slice(-2)}`
  endDateInitial = `${this.year}-${`0${this.endDateMonth}`.slice(-2)}-${`0${new Date().getDate()}`.slice(-2)}`
  errorCode = 0
  startDate = ''
  endDate = ''
  search = ''
  dataSource: any
  scheduleData: IScheduleData[] = []
  location: string[] = []
  localFilter = ''
  emailId = ''
  status = false
  sortedLocation: string[] = []
  locationFilter = []
  sortedList: string[] = []
  minDate: Date = new Date()
  maxDate: Date = new Date(new Date().getTime() + 86400000 * 90)
  fetching: { [offeringId: string]: boolean } = {}
  locationSet: any
  @ViewChild('successDeRegContent', { static: true })
  successDeRegContentMessage!: ElementRef<any>
  @ViewChild('alreadyDeRegContent', { static: true })
  alreadyDeRegContentMessage!: ElementRef<any>
  @ViewChild('notRegContent', { static: true })
  notRegContentMessage!: ElementRef<any>
  @ViewChild('expireContent', { static: true })
  expireContentMessage!: ElementRef<any>
  @ViewChild('failedDeRegContent', { static: true })
  failedDeRegContentMessage!: ElementRef<any>
  @ViewChild('successRegContent', { static: true })
  successRegContentMessage!: ElementRef<any>
  @ViewChild('existsRegContent', { static: true })
  existsRegContentMessage!: ElementRef<any>
  @ViewChild('alreadyRegContent', { static: true })
  alreadyRegContentMessage!: ElementRef<any>
  @ViewChild('notExistsContent', { static: true })
  notExistsContentMessage!: ElementRef<any>
  @ViewChild('failedRegContent', { static: true })
  failedRegContentMessage!: ElementRef<any>
  @ViewChild('seatsFullContent', { static: true })
  seatsFullContentMessage!: ElementRef<any>
  @ViewChild('notMetContent', { static: true })
  notMetContentMessage!: ElementRef<any>
  @ViewChild('closedRegContent', { static: true })
  closedRegContentMessage!: ElementRef<any>
  @ViewChild('conflictsRegContent', { static: true })
  conflictsRegContentMessage!: ElementRef<any>
  @ViewChild('paginator', { static: true }) paginator: MatPaginator | null = null
  constructor(
    private form1: FormBuilder,
    public matSnackBar: MatSnackBar,
    private trainingSrv: TrainingApiService,

  ) {
    this.searchForm = this.form1.group({
      search: [''],
    })

    this.scheduleForm = this.form1.group({
      search: [''],
      dateStart: [''],
      dateEnd: [''],
      location: [''],
    })
  }
  ngOnInit() {

    this.startDate = this.startDateInitial
    this.endDate = this.endDateInitial
  }

  ngAfterViewInit() {
    this.scheduleFetchStatus = 'fetching'
    this.startDate = this.startDateInitial
    this.endDate = this.endDateInitial
    this.scheduleObj = {
      startDate: this.startDate,
      endDate: this.endDate,
      location: '',
      search: '',
    }
    this.getSchedule()
  }
  getSchedule() {
    this.trainingSrv.getSchedule(this.scheduleObj).subscribe((res: IScheduleDataResponse) => {
      this.scheduleData = res.hits
      this.scheduleData = this.scheduleData.map((resData: IScheduleData) => {
        if (resData.title.length > 30) {
          resData.title = `${resData.title.substring(0, 30)}...`
        } else {
          resData.title = resData.title
        }
        resData.isRegister =
          localStorage.getItem(`register_${resData.intCourseOfferingId}`) === 'true'
        return resData
      })
      this.scheduleData.forEach((cur: IScheduleData) => {
        if (cur.location !== 'VIRTUAL CLASSROOM') {
          this.location.push(cur.location)
        }
        this.location.sort()
        this.sortedLocation.push('ALL')
        this.sortedLocation.push('VIRTUAL CLASSROOM')
        this.sortedList = this.sortedLocation.concat(this.location)
        this.locationSet = new Set(this.sortedList)
      })
      this.dataSource = new MatTableDataSource<IScheduleData>(this.scheduleData)
      this.dataSource.paginator = this.paginator
      this.scheduleFetchStatus = 'done'
    },
      // tslint:disable-next-line:align
      () => {
        this.scheduleFetchStatus = 'error'
      },
    )
  }
  openSnackBarDel() {
    if (this.errorCode === 1) {
      this.matSnackBar.open(this.successDeRegContentMessage.nativeElement.value)
    } else if (this.errorCode === -12) {
      this.matSnackBar.open(this.alreadyDeRegContentMessage.nativeElement.value)
      this.scheduleData = this.scheduleData.map(resData => {
        resData.isRegister =
          localStorage.getItem(`register_${resData.intCourseOfferingId}`) === 'true'
        return resData
      })
    } else if (this.errorCode === -3) {
      this.matSnackBar.open(this.notRegContentMessage.nativeElement.value)
    } else if (this.errorCode === -4) {
      this.matSnackBar.open(this.expireContentMessage.nativeElement.value)
    } else {
      this.matSnackBar.open(this.failedDeRegContentMessage.nativeElement.value)
    }
  }

  openSnackBar() {
    if (this.errorCode === 1) {
      this.matSnackBar.open(this.successRegContentMessage.nativeElement.value)
    } else if (this.errorCode === -6) {
      this.matSnackBar.open(this.existsRegContentMessage.nativeElement.value)
    } else if (this.errorCode === -3) {
      this.matSnackBar.open(this.alreadyRegContentMessage.nativeElement.value)
      this.scheduleData = this.scheduleData.map(resData => {
        resData.isRegister =
          localStorage.getItem(`register_${resData.intCourseOfferingId}`) ===
          'false'
        return resData
      })
    } else if (this.errorCode === -1) {
      this.matSnackBar.open(this.notExistsContentMessage.nativeElement.value)
    } else if (this.errorCode === -12) {
      this.matSnackBar.open(this.failedRegContentMessage.nativeElement.value)
    } else if (this.errorCode === -13) {
      this.matSnackBar.open(this.seatsFullContentMessage.nativeElement.value)
    } else if (this.errorCode === -6) {
      this.matSnackBar.open(this.notMetContentMessage.nativeElement.value)
    } else if (this.errorCode === -4) {
      this.matSnackBar.open(this.closedRegContentMessage.nativeElement.value)
    } else if (this.errorCode === -5) {
      this.matSnackBar.open(this.conflictsRegContentMessage.nativeElement.value)
    } else {
      this.matSnackBar.open(this.failedRegContentMessage.nativeElement.value)
    }
  }

  applyDateFilter() {
    this.scheduleFetchStatus = 'fetching'
    if (this.scheduleForm.controls.location.value === 'ALL') {
      this.localFilter = ''
    } else {
      this.localFilter = this.scheduleForm.controls.location.value
    }
    if (this.scheduleForm.controls.dateStart.value === '') {
      this.startDate = this.startDateInitial
    } else if (this.scheduleForm.controls.dateEnd.value === '') {
      this.endDate = this.endDateInitial
    } else {
      // tslint:disable-next-line:max-line-length
      this.startDate = `${this.scheduleForm.controls.dateStart.value.getFullYear()}-${`0${this.scheduleForm.controls.dateStart.value.getMonth() + 1}`.slice(-2)}-${`0${this.scheduleForm.controls.dateStart.value.getDate()}`.slice(-2)}`
      // tslint:disable-next-line:max-line-length
      this.endDate = `${this.scheduleForm.controls.dateEnd.value.getFullYear()}-${`0${this.scheduleForm.controls.dateEnd.value.getMonth() + 1}`.slice(-2)}-${`0${this.scheduleForm.controls.dateEnd.value.getDate()}`.slice(-2)}`
    }
    this.search = this.scheduleForm.controls.search.value
    this.scheduleObj = {
      startDate: this.startDate,
      endDate: this.endDate,
      location: this.localFilter,
      search: this.search,
    }
    this.trainingSrv.getSchedule(this.scheduleObj).subscribe(
      (res: IScheduleDataResponse) => {
        this.scheduleData = res.hits
        this.dataSource = new MatTableDataSource<IScheduleData>(this.scheduleData)
        this.dataSource.paginator = this.paginator
        this.scheduleFetchStatus = 'done'
      },
      () => {
        this.scheduleFetchStatus = 'error'
      },
    )
  }
  resetDateFilter() {
    this.scheduleFetchStatus = 'fetching'
    this.endDate = this.endDateInitial
    this.startDate = this.startDateInitial
    this.localFilter = ''
    this.search = ''
    this.scheduleObj = {
      startDate: this.startDate,
      endDate: this.endDate,
      location: this.localFilter,
      search: this.search,
    }
    this.trainingSrv.getSchedule(this.scheduleObj).subscribe(
      (res: IScheduleDataResponse) => {
        this.scheduleData = res.hits
        this.dataSource = new MatTableDataSource<IScheduleData>(this.scheduleData)
        this.dataSource.paginator = this.paginator
        this.scheduleFetchStatus = 'done'
      },
      () => {
        this.scheduleFetchStatus = 'error'
      },
    )
  }
  register(courseId: number) {
    this.fetching[courseId] = true
    this.registerObj = {
      courseId,
    }
    this.trainingSrv.registerForTraining(courseId).subscribe(
      (response: ITrainingApiResponse) => {
        this.errorCode = response.res_code
        this.scheduleData = this.scheduleData.map((resData: IScheduleData) => {
          if (courseId === parseInt(resData.intCourseOfferingId, 10)) {
            resData.isRegister = true
            this.openSnackBar()
          }
          localStorage.setItem(`register_${courseId}`, 'true')
          this.fetching[courseId] = false
          return resData
        })
        this.getSchedule()
      },
      err => {
        this.errorCode = err.error.res_code
        this.openSnackBar()

        if (this.errorCode === -6) {
          localStorage.setItem(`register_${courseId}`, 'true')
        }
        this.fetching[courseId] = false
      },
    )

  }

  deRegister(courseId: number) {
    this.fetching[courseId] = true
    this.registerObj = {
      courseId,
    }
    this.trainingSrv.deregisterFromTraining(courseId).subscribe(
      (response: ITrainingApiResponse) => {
        this.errorCode = response.res_code
        this.scheduleData = this.scheduleData.map((resData: IScheduleData) => {
          if (courseId === parseInt(resData.intCourseOfferingId, 10)) {
            resData.isRegister = false
            this.openSnackBarDel()
          }
          localStorage.setItem(`register_${courseId}`, 'false')
          this.fetching[courseId] = false
          return resData
        })
        this.getSchedule()
      },
      err => {
        this.errorCode = err.error.res_code
        this.openSnackBarDel()
        if (this.errorCode === -6) {
          localStorage.setItem(`register_${courseId}`, 'false')
        }
        this.fetching[courseId] = false
      },
    )
  }
}

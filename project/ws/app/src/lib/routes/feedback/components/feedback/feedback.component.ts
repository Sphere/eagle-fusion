import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { NgForm } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { NsFeedback } from '@ws-widget/collection'
import { BtnContentFeedbackService } from '@ws-widget/collection/src/lib/btn-content-feedback/btn-content-feedback.service'
import { ConfigurationsService } from 'library/ws-widget/utils/src/lib/services/configurations.service'
import { Subscription } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { IFeedbackRequest } from '../../models/feedback.model'
@Component({
  selector: 'ws-app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit, OnDestroy {
  @Input() widgetType!: string
  @Input() widgetSubType!: string
  @Input() widgetInstanceId?: string
  @Input() widgetData!: any
  tabs = ['application', 'applicationcontent', 'bug']
  currentTabIndex = 0
  feedbackBugImg = ''
  feedbackRequestData: any
  feedbackRequest: IFeedbackRequest = {
    application: {
      contentId: null,
      feedback: [
        {
          question: '',
          meta: '',
          answer: '',
        },
        {
          question: '',
          meta: '',
          answer: '',
        },
      ],
      feedbackSubType: null,
      feedbackType: '',
      rating: '',
    },
    applicationcontent: {
      contentId: null,
      feedback: [
        {
          question: 'I Like',
          meta: 'I Like',
          answer: '',
        },
        {
          question: 'I Wish',
          meta: 'I Wish',
          answer: '',
        },
      ],
      feedbackSubType: null,
      feedbackType: 'applicationcontent',
      rating: '-1',
    },
    bug: {
      contentId: null,
      feedback: [
        {
          question: 'Share with us what you have found',
          meta: 'bug',
          answer: '',
        },
      ],
      feedbackSubType: null,
      feedbackType: 'bug',
    },
  }
  submitInProgress = false
  ratingLoop: number[] = []
  numbersPattern = /^[1-9]\d*/
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>
  private prefChangeSubs: Subscription | null = null
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private route: ActivatedRoute,
    private confSvc: ConfigurationsService,
    private submitFeedbackSvc: BtnContentFeedbackService,
  ) { }

  ngOnInit() {
    this.route.data.subscribe(response => {
      if (response.feedbackJson.data) {
        this.feedbackRequestData = response.feedbackJson.data
        this.feedbackImg(this.feedbackRequestData)
      }
    })
    this.prefChangeSubs = this.confSvc.prefChangeNotifier.pipe(debounceTime(500)).subscribe(() => {
      this.feedbackImg(this.feedbackRequestData)
    })
    this.resetFeedbackForm()
    this.activatedRoute.paramMap.subscribe(params => {
      const param = params.get('type') ? params.get('type') : ''
      if (param) {
        this.currentTabIndex = this.tabs.indexOf(param) > -1 ? this.tabs.indexOf(param) : 0
      }
    })
  }

  submitFeedback(request: NsFeedback.IWsFeedbackTypeRequest, form: NgForm) {
    this.submitInProgress = true
    this.submitFeedbackSvc.submitFeedback(request).subscribe(
      () => {
        this.resetFeedbackForm()
        form.resetForm()
        this.submitInProgress = false
        this.openSnackbar(this.toastSuccess.nativeElement.value)
      },
      () => {
        this.openSnackbar(this.toastError.nativeElement.value)
        this.submitInProgress = false
        // //console.log('err >', err);
      },
    )
  }
  updateRoute(index: number) {
    this.router.navigate(['app/feedback', this.tabs[index] ? this.tabs[index] : this.tabs[0]])
  }

  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

  resetFeedbackForm() {
    this.ratingLoop = Array(5)
    this.ratingLoop.fill(1)
    this.feedbackRequest = {
      application: {
        contentId: null,
        feedback: [
          {
            question: 'I Like',
            meta: 'I Like',
            answer: '',
          },
          {
            question: 'I Wish',
            meta: 'I Wish',
            answer: '',
          },
        ],
        feedbackSubType: null,
        feedbackType: 'application',
        rating: '-1',
      },
      applicationcontent: {
        contentId: null,
        feedback: [
          {
            question: 'I Like',
            meta: 'I Like',
            answer: '',
          },
          {
            question: 'I Wish',
            meta: 'I Wish',
            answer: '',
          },
        ],
        feedbackSubType: null,
        feedbackType: 'applicationcontent',
        rating: '-1',
      },
      bug: {
        contentId: null,
        feedback: [
          {
            question: 'Share with us what you have found',
            meta: 'bug',
            answer: '',
          },
        ],
        feedbackSubType: null,
        feedbackType: 'bug',
      },
    }
  }
  feedbackImg(feedbackRequestData: any) {
    if (feedbackRequestData != null) {
      if (this.confSvc.isDarkMode) {
        this.feedbackBugImg = feedbackRequestData.feedbackBugImgDark
      } else {
        this.feedbackBugImg = feedbackRequestData.feedbackBugImgLite
      }
    }
  }
  ngOnDestroy() {
    if (this.prefChangeSubs) {
      this.prefChangeSubs.unsubscribe()
    }
  }
}

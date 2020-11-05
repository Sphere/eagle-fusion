import { Component, OnDestroy, OnInit } from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { Observable, Subscription } from 'rxjs'
import { retry } from 'rxjs/operators'
import { EditorService } from '../../../../../../../author/src/lib/routing/modules/editor/services/editor.service'
import { TrainingApiService } from '../../../infy/routes/training/apis/training-api.service'
import { TrainingService } from '../../../infy/routes/training/services/training.service'
import { NsAppToc } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'

@Component({
  selector: 'ws-app-knowledge-artifact-details',
  templateUrl: './knowledge-artifact-details.component.html',
  styleUrls: ['./knowledge-artifact-details.component.scss'],
})
export class KnowledgeArtifactDetailsComponent implements OnInit, OnDestroy {
  content: NsContent.IContent | null = null
  routeSubscription: Subscription | null = null
  viewMoreRelatedTopics = false
  hasTocStructure = false
  tocStructure: NsAppToc.ITocStructure | null = null
  askAuthorEnabled = true
  trainingLHubEnabled = false
  trainingLHubCount$?: Observable<number>
  body: SafeHtml | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  isDownloadableDesktop = false
  isDownloadableMobile = false
  relatedResource: NsContent.IContentMinimal[] | null = null
  fetchingRelatedResources = true
  isAuthor = false
  deletingContent = false
  forPreview = window.location.href.includes('/author/')

  constructor(
    private route: ActivatedRoute,
    private tocSharedSvc: AppTocService,
    private configSvc: ConfigurationsService,
    private trainingApi: TrainingApiService,
    private trainingSvc: TrainingService,
    private domSanitizer: DomSanitizer,
    private contentSvc: WidgetContentService,
    private editorSvc: EditorService,
    private router: Router,
  ) {
    if (this.configSvc.restrictedFeatures) {
      this.askAuthorEnabled = !this.configSvc.restrictedFeatures.has('askAuthor')
      this.trainingLHubEnabled = !this.configSvc.restrictedFeatures.has('trainingLHub')
    }
  }

  ngOnInit() {
    if (this.route) {
      this.routeSubscription = this.route.data.subscribe((data: Data) => {
        this.initData(data)
        if (this.content) {
          this.fetchingRelatedResources = true
          this.tocSharedSvc
            .fetchContentWhatsNext(this.content.identifier, this.content.contentType)
            .subscribe(
              (result: NsContent.IContentMinimal[]) => {
                this.relatedResource = result
                this.fetchingRelatedResources = false
              },
              _ => {
                this.fetchingRelatedResources = false
              },
            )
        }
      })
    }
    if (this.configSvc.restrictedFeatures) {
      this.isDownloadableMobile = this.configSvc.restrictedFeatures.has('mobileDownloadRequest')
      this.isDownloadableDesktop = this.configSvc.restrictedFeatures.has('downloadRequest')
    }
    if (
      this.content &&
      this.content.artifactUrl.indexOf('content-store') >= 0 &&
      !this.forPreview
    ) {
      this.setS3Cookie(this.content.identifier)
    }
  }
  private checkIfEditEnabled() {
    const userProfile = this.configSvc.userProfile
    const restrictedFeatures = this.configSvc.restrictedFeatures
    if (userProfile && this.content && restrictedFeatures) {
      if (
        !restrictedFeatures.has('editContent') ||
        (!restrictedFeatures.has('editContentAuthor') &&
          this.content.creatorContacts &&
          this.content.creatorContacts.some(creator => creator.id === userProfile.userId))
      ) {
        this.isAuthor = true
      }
    }
  }

  deleteContent() {
    if (this.content) {
      this.deletingContent = true
      this.editorSvc.deleteContent(this.content.identifier).subscribe(
        () => {
          this.deletingContent = false
          this.router.navigate(['/page/home'])
        },
        _ => {
          this.deletingContent = false
        },
      )
    }
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }

  get showSubtitleOnBanner() {
    return this.tocSharedSvc.subtitleOnBanners
  }
  get showDescription() {
    if (this.content && !this.content.body) {
      return true
    }
    return this.tocSharedSvc.showDescription
  }

  private initData(data: Data) {
    const initData = this.tocSharedSvc.initData(data)
    this.content = initData.content
    this.body = this.domSanitizer.bypassSecurityTrustHtml(
      this.content ? this.content.body || '' : '',
    )
    this.resetAndFetchTocStructure()
    if (!this.forPreview) {
      this.getTrainingCount()
    }
    if (this.content && this.content.identifier) {
      this.checkIfEditEnabled()
    }
  }

  resetAndFetchTocStructure() {
    this.tocStructure = {
      assessment: 0,
      course: 0,
      handsOn: 0,
      interactiveVideo: 0,
      learningModule: 0,
      other: 0,
      pdf: 0,
      podcast: 0,
      quiz: 0,
      video: 0,
      webModule: 0,
      webPage: 0,
      youtube: 0,
    }
    if (this.content) {
      this.hasTocStructure = true
      this.tocStructure.learningModule = this.content.contentType === 'Collection' ? -1 : 0
      this.tocStructure.course = this.content.contentType === 'Course' ? -1 : 0
      this.tocStructure = this.tocSharedSvc.getTocStructure(this.content, this.tocStructure)
      for (const progType in this.tocStructure) {
        if (this.tocStructure[progType] > 0) {
          this.hasTocStructure = true
          break
        }
      }
    }
  }

  // For Learning Hub trainings
  private getTrainingCount() {
    if (
      this.trainingLHubEnabled &&
      this.content &&
      this.trainingSvc.isValidTrainingContent(this.content)
    ) {
      this.trainingLHubCount$ = this.trainingApi
        .getTrainingCount(this.content.identifier)
        .pipe(retry(2))
    }
  }

  get isGreyedImage() {
    if (this.content && (this.content.status === 'Deleted' || this.content.status === 'Expired')) {
      return true
    }
    return false
  }
  get isLiveOrMarkForDeletion() {
    if (
      this.content &&
      (this.content.status === 'Live' || this.content.status === 'MarkedForDeletion')
    ) {
      return true
    }
    return false
  }
  get isDownloadable() {
    if (this.content && this.content.downloadUrl) {
      return true
    }
    return false
  }

  download() {
    if (this.content && !this.forPreview) {
      const link = document.createElement('a')
      link.download = this.content.name
      link.target = '_blank'

      link.href = this.content.downloadUrl || ''
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
    }
  }
  private async setS3Cookie(identifier: string) {
    await this.contentSvc
      .setS3Cookie(identifier)
      .toPromise()
      .catch(() => {})
    return
  }
}

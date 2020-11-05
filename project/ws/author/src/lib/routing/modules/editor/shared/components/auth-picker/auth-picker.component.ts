import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { SEARCH_V6_AUTH } from '@ws/author/src/lib/constants/apiEndpoints'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { BehaviorSubject, EMPTY, Subscription, timer } from 'rxjs'
import { debounce, mergeMap } from 'rxjs/operators'

interface IAuthPickerData {
  filter: any
  selectedIds: string[]
}
@Component({
  selector: 'ws-auth-picker',
  templateUrl: './auth-picker.component.html',
  styleUrls: ['./auth-picker.component.scss'],
  // tslint:disable-next-line: use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
})
export class AuthPickerComponent implements OnInit, OnDestroy {
  query = ''
  selectedContents: NSContent.IContentMeta[] = []
  selectedContentIds = new Set<string>()
  searchFetchStatus: TFetchStatus = 'none'
  searchResults: NSContent.IContentMeta[] = []
  debounceSubject = new BehaviorSubject<boolean>(false)
  debounceSubscription: Subscription | null = null
  defaultThumbnail = ''
  preSelected = new Set()
  showMine = true

  constructor(
    private configSvc: ConfigurationsService,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<AuthPickerComponent>,
    private accessService: AccessControlService,
    @Inject(MAT_DIALOG_DATA) public data: IAuthPickerData,
  ) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
  }

  ngOnInit() {
    this.initializeSearchSubject()
    this.preSelected = new Set(Array.from(this.data.selectedIds || new Set()))
  }

  async initializeSearchSubject() {
    this.debounceSubscription = this.debounceSubject
      .pipe(
        debounce(shouldDebounce => (shouldDebounce ? timer(500) : EMPTY)),
        mergeMap(() => {
          this.searchFetchStatus = 'fetching'
          this.searchResults = []
          const searchQuery = {
            query: this.query || '',
            rootOrg: this.accessService.rootOrg,
            filters: [
              {
                andFilters: [
                  {
                    ...this.data.filter,
                    creatorContacts: this.showMine ? [this.accessService.userId] : undefined,
                  },
                ],
              },
            ],
            pageSize: 24,
            sort: this.query ? undefined : [{ lastUpdatedOn: 'desc' }],
            uuid: this.accessService.userId,
            pageNo: 0,
          }
          if (this.showMine && this.configSvc.userProfile) {
            searchQuery.filters[0].andFilters[0].status = searchQuery.filters[0].andFilters[0]
              .status
              ? searchQuery.filters[0].andFilters[0].status
              : ['Draft', 'InReview', 'QualityReview', 'Reviewed', 'Live']
          }
          return this.apiService.post<any>(SEARCH_V6_AUTH, searchQuery)
        }),
      )
      .subscribe(
        search => {
          this.searchFetchStatus = 'done'
          if (search && search.result) {
            this.searchResults = search.result
          }
        },
        () => {
          this.searchFetchStatus = 'error'
        },
      )
  }

  selectedContentChanged(content: NSContent.IContentMeta, checked: boolean) {
    if (checked) {
      this.selectedContents.push(content)
      this.selectedContentIds.add(content.identifier)
    } else {
      this.selectedContentIds.delete(content.identifier)
      this.selectedContents = this.selectedContents.filter(v => v.identifier !== content.identifier)
    }
  }

  close() {
    this.dialogRef.close(this.selectedContents.map(v => v.identifier))
  }

  ngOnDestroy() {
    if (this.debounceSubscription) {
      this.debounceSubscription.unsubscribe()
    }
  }
}

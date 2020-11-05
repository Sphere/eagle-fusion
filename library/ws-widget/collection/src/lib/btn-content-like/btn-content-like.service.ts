import { Injectable } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs'
import { map, tap, take } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'

const API_END_POINTS = {
  USER_CONTENT_LIKE: `/apis/protected/v8/user/content/like`,
  USER_CONTENT_UNLIKE: `/apis/protected/v8/user/content/unlike`,
  CONTENT_LIKES: `/apis/protected/v8/user/content/contentLikes`,
}

@Injectable({
  providedIn: 'root',
})
export class BtnContentLikeService {

  fetchingLikes = false
  private likesReplaySubject: ReplaySubject<Set<string>> = new ReplaySubject(1)
  private likedIds: Set<string> | null = null
  constructor(
    private http: HttpClient,
  ) { }

  private fetchContentLikes() {
    if (this.fetchingLikes) {
      return
    }
    this.fetchingLikes = true
    this.http.get<string[]>(API_END_POINTS.USER_CONTENT_LIKE).subscribe(
      likedIds => {
        this.fetchingLikes = false
        this.likedIds = new Set(likedIds)
        this.likesReplaySubject.next(new Set(likedIds))
      },
      _ => {
        this.likesReplaySubject.next(new Set([]))
        this.fetchingLikes = false
      })
  }
  private likedSubs() {
    if (!this.likedIds) {
      this.fetchContentLikes()
    }
    return this.likesReplaySubject
  }
  isLikedFor(contentId: string): Observable<boolean> {
    return this.likedSubs().pipe(map(likedIds => likedIds.has(contentId)))
  }
  like(contentId: string) {
    return this.http.post<{ [key: string]: number }>(`${API_END_POINTS.USER_CONTENT_LIKE}/${contentId}`, {}).pipe(
      tap(() => {
        this.likesReplaySubject.pipe(take(1))
          .subscribe(set => {
            set.add(contentId)
            this.likesReplaySubject.next(set)
          })
      }),
    )
  }
  unlike(contentId: string) {
    return this.http.delete<{ [key: string]: number }>(`${API_END_POINTS.USER_CONTENT_UNLIKE}/${contentId}`).pipe(
      tap(() => {
        this.likesReplaySubject.pipe(take(1))
          .subscribe(set => {
            set.delete(contentId)
            this.likesReplaySubject.next(set)
          })
      }),
    )
  }

  fetchContentSpecificLikes(contentIds: string[]) {
    return this.http.post<{ [key: string]: number }>(`${API_END_POINTS.CONTENT_LIKES}`, {
      content_id: contentIds,
    })
  }
}

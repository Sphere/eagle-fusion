import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, ReplaySubject, throwError } from 'rxjs'
import { first, map, mergeMap, tap } from 'rxjs/operators'
import { NsContent } from '../_services/widget-content.model'
import { NsPlaylist } from './btn-playlist.model'

const API_END_POINTS = {
  featureConfig: `/assets/configurations/feature/playlist.json`,
  getAllPlaylists: `/apis/protected/v8/user/playlist`,
  deletePlaylist: `/apis/protected/v8/user/playlist`,
  playlist: (type: NsPlaylist.EPlaylistTypes) => `/apis/protected/v8/user/playlist/${type}`,
  createPlaylist: `/apis/protected/v8/user/playlist`,
  upsertPlaylist: (playlistId: string) => `/apis/protected/v8/user/playlist/${playlistId}`,
  acceptPlaylist: (playlistId: string) => `/apis/protected/v8/user/playlist/accept/${playlistId}`,
  rejectPlaylist: (playlistId: string) => `/apis/protected/v8/user/playlist/reject/${playlistId}`,
  sharePlaylist: '/apis/protected/v8/user/playlist/share',
  updatePlaylists: (playlistId: string) => `/apis/protected/v8/user/playlist/${playlistId}`,
}

@Injectable({
  providedIn: 'root',
})
export class BtnPlaylistService {
  private playlistSubject: { [key: string]: ReplaySubject<NsPlaylist.IPlaylist[]> } = {}
  isFetchingPlaylists = false

  constructor(private http: HttpClient) {
  }

  upsertPlaylist(playlistCreateRequest: NsPlaylist.IPlaylistCreateRequest, updatePlaylists = true) {
    return this.http.post<string>(`${API_END_POINTS.createPlaylist}/create`, playlistCreateRequest).pipe(
      tap(_ => {
        if (updatePlaylists) {
          this.updatePlaylists()
        }
      }),
    )
  }

  addToPlaylist(playlistId: string, playlistAddRequest: NsPlaylist.IPlaylistUpsertRequest, updatePlaylists = true) {
    return this.http.post<string>(`${API_END_POINTS.upsertPlaylist(playlistId)}/add`, playlistAddRequest).pipe(
      tap(_ => {
        if (updatePlaylists) {
          this.updatePlaylists()
        }
      }),
    )
  }

  syncPlaylist(playlistId: string, updatePlaylists = true) {
    return this.http.get<NsContent.IContent[]>(`${API_END_POINTS.upsertPlaylist}/sync/${playlistId}`).pipe(
      tap(_ => {
        if (updatePlaylists) {
          this.updatePlaylists()
        }
      }),
    )
  }

  deleteContent(playlistId: string, deleteRequest: NsPlaylist.IPlaylistUpsertRequest, updatePlaylists = true) {
    return this.http.post<string>(`${API_END_POINTS.upsertPlaylist(playlistId)}/delete`, deleteRequest).pipe(
      tap(_ => {
        if (updatePlaylists) {
          this.updatePlaylists()
        }
      }),
    )
  }

  getAllPlaylistsApi(detailsRequired: boolean) {
    const params = new HttpParams().set('details-required', String(detailsRequired))
    return this.http
      .get<NsPlaylist.IPlaylistResponse>(API_END_POINTS.getAllPlaylists, { params })
  }

  getPlaylists(type: NsPlaylist.EPlaylistTypes) {
    if (!this.playlistSubject[type]) {
      this.initSubjects()
    }
    this.updatePlaylists()
    return this.playlistSubject[type].asObservable()
  }

  getAllPlaylists() {
    return this.getPlaylists(NsPlaylist.EPlaylistTypes.ME).pipe(
      mergeMap((my: NsPlaylist.IPlaylist[]) => this.getPlaylists(NsPlaylist.EPlaylistTypes.SHARED).pipe(
        map((shared: NsPlaylist.IPlaylist[]) => my.concat(shared)),
      )),
    )
  }

  getPlaylist(playlistId: string, type: NsPlaylist.EPlaylistTypes, sourceFields: string): Observable<NsPlaylist.IPlaylist | null> {
    const params = new HttpParams().set('sourceFields', sourceFields)
    return this.http
      .get<NsPlaylist.IPlaylist>(`${API_END_POINTS.playlist(type)}/${playlistId}`, { params })
  }

  deletePlaylist(playlistId: string, type: NsPlaylist.EPlaylistTypes) {
    return this.http.delete(`${API_END_POINTS.deletePlaylist}/${playlistId}`).pipe(
      tap(() => {
        if (this.playlistSubject[type]) {
          this.playlistSubject[type].pipe(first()).subscribe((playlists: NsPlaylist.IPlaylist[]) => {
            this.playlistSubject[type].next(playlists.filter(playlist => playlist.id !== playlistId))
          })
        }
      }),
    )
  }

  patchPlaylist(playlist: NsPlaylist.IPlaylist, newIDs?: string[]) {
   // tslint:disable-next-line
    const content_ids = playlist.contents.map(content => {
      const id = { identifier: content.identifier }
      return id
    })
    if (newIDs && newIDs.length > 0) {
      newIDs.forEach(content => {
        content_ids.push({ identifier: content })
      })
    }

    return this.http.patch(`${API_END_POINTS.updatePlaylists(playlist.id)}`, {
      content_ids,
      playlist_title: playlist.name,
    })
  }

  addPlaylistContent(playlist: NsPlaylist.IPlaylist, contentIds: string[], updatePlaylists = true) {
    return this.addToPlaylist(
      playlist.id,
      {
        contentIds,
      },
      updatePlaylists,
    )
  }

  deletePlaylistContent(playlist: NsPlaylist.IPlaylist | undefined, contentIds: string[]) {
    if (playlist) {
      return this.deleteContent(
        playlist.id,
        {
          contentIds,
        },
        false
      )
    }
    return throwError({ error: 'ERROR_PLAYLIST_UNDEFINED' })
  }

  acceptPlaylist(playlistId: string) {
    return this.http.post(API_END_POINTS.acceptPlaylist(playlistId), null).pipe()
  }

  rejectPlaylist(playlistId: string) {
    return this.http.post(API_END_POINTS.rejectPlaylist(playlistId), null).pipe(
      tap(() => {
        if (this.playlistSubject[NsPlaylist.EPlaylistTypes.PENDING]) {
          this.playlistSubject[NsPlaylist.EPlaylistTypes.PENDING].pipe(first()).subscribe((playlists: NsPlaylist.IPlaylist[]) => {
            this.playlistSubject[NsPlaylist.EPlaylistTypes.PENDING].next(
              playlists.filter(playlist => playlist.id !== playlistId),
            )
          })
        }
      }),
    )
  }

  sharePlaylist(shareRequest: NsPlaylist.IPlaylistShareRequest, playlistId: string) {
    return this.http.post(`${API_END_POINTS.sharePlaylist}/${playlistId}`, shareRequest)
  }

  private updatePlaylists() {
    if (this.isFetchingPlaylists) {
      return
    }
    this.isFetchingPlaylists = true
    if (!Object.entries(this.playlistSubject).length) {
      this.initSubjects()
    }
    this.http
      .get<NsPlaylist.IPlaylistResponse>(API_END_POINTS.getAllPlaylists).subscribe(
        (playlists: NsPlaylist.IPlaylistResponse) => {
          this.playlistSubject[NsPlaylist.EPlaylistTypes.ME].next(playlists.user)
          this.playlistSubject[NsPlaylist.EPlaylistTypes.SHARED].next(playlists.share)
          this.playlistSubject[NsPlaylist.EPlaylistTypes.PENDING].next(playlists.pending)
          this.isFetchingPlaylists = false
        },
        error => {
          this.playlistSubject[NsPlaylist.EPlaylistTypes.ME].error(error)
          this.playlistSubject[NsPlaylist.EPlaylistTypes.SHARED].error(error)
          this.playlistSubject[NsPlaylist.EPlaylistTypes.PENDING].error(error)
          this.isFetchingPlaylists = false
        })
  }

  private initSubjects() {
    this.playlistSubject[NsPlaylist.EPlaylistTypes.ME] = new ReplaySubject<NsPlaylist.IPlaylist[]>()
    this.playlistSubject[NsPlaylist.EPlaylistTypes.SHARED] = new ReplaySubject<NsPlaylist.IPlaylist[]>()
    this.playlistSubject[NsPlaylist.EPlaylistTypes.PENDING] = new ReplaySubject<NsPlaylist.IPlaylist[]>()
  }
}

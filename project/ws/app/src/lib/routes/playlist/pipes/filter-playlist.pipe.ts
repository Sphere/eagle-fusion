import { Pipe, PipeTransform } from '@angular/core'
import { NsPlaylist } from '@ws-widget/collection'

@Pipe({
  name: 'filterPlaylist',
})
export class FilterPlaylistPipe implements PipeTransform {
  transform(playlists: NsPlaylist.IPlaylist[], searchPlaylistQuery: string): NsPlaylist.IPlaylist[] | undefined {
    const filteredPlaylists = playlists.filter(
      (playlist: NsPlaylist.IPlaylist) =>
        playlist.name.toLowerCase().includes((searchPlaylistQuery || '').toLowerCase()),
    )

    return filteredPlaylists.length ? filteredPlaylists : undefined
  }
}

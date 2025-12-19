import { Injectable } from '@angular/core'
import { data } from '../services/sampleData'

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  constructor() { }

  getPlaylistData() {
    return data
  }
}

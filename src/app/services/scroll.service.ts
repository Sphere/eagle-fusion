import { Injectable, EventEmitter } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  scrollToDivEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }
}
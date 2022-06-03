import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ws-mobile-category',
  templateUrl: './mobile-category.component.html',
  styleUrls: ['./mobile-category.component.scss'],
})
export class MobileCategoryComponent implements OnInit {
  categories: any
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('/apis/protected/v8/catalog').subscribe((data: any) => {
      this.categories =  data.terms
    })
  }

}

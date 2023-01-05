import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class CompetencyService {

  competencyData: any

  constructor() { }

  pushCompetencyData(data: any) {
    this.competencyData = data
  }

  get getCompetencyData() {
    return this.competencyData
  }
}

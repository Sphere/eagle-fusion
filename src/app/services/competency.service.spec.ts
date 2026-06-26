import { CompetencyService } from './competency.service'

describe('CompetencyService', () => {
  let service: CompetencyService

  beforeEach(() => {
    service = new CompetencyService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('competencyData is undefined initially', () => {
    expect(service.competencyData).toBeUndefined()
  })

  it('pushCompetencyData stores the provided data', () => {
    const data = { name: 'Clinical Skills', level: 2 }
    service.pushCompetencyData(data)
    expect(service.competencyData).toEqual(data)
  })

  it('getCompetencyData returns the stored data', () => {
    const data = [{ name: 'Patient Care' }]
    service.pushCompetencyData(data)
    expect(service.getCompetencyData).toEqual(data)
  })

  it('pushCompetencyData overwrites previous data', () => {
    service.pushCompetencyData({ first: true })
    service.pushCompetencyData({ second: true })
    expect(service.getCompetencyData).toEqual({ second: true })
  })

  it('getCompetencyData returns undefined before any push', () => {
    expect(service.getCompetencyData).toBeUndefined()
  })
})
